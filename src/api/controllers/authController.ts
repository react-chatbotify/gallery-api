import { Request, Response } from 'express';

import {
  fetchTokensWithCode,
  getUserData,
  saveUserTokens,
} from '../services/authentication/authentication';
import { encrypt } from '../services/cryptoService';
import { randomBytes } from 'crypto';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseUtils';
import Logger from '../logger';

/**
 * Handles the callback when a user authorizes or rejects the application.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns redirects user to login process page on frontend on success, error page otherwise
 */
const handleCallback = async (req: Request, res: Response) => {
  // State validation must happen before anything else.
  const receivedState = req.query.state as string;
  const sessionState = req.session.oAuthState;

  delete req.session.oAuthState; // Clear state from session immediately for security (one-time use)

  if (!receivedState || !sessionState || receivedState !== sessionState) {
    Logger.error('Invalid OAuth state.', {
      received: receivedState,
      expected: sessionState,
    });
    // For state validation failure, redirect_url from the initial call is not available.
    // Use a known safe default frontend URL.
    const defaultFrontendErrorUrl = (process.env.FRONTEND_WEBSITE_URLS || '')
      .split(',')[0]
      ?.trim();
    if (defaultFrontendErrorUrl) {
      return res.redirect(
        `${defaultFrontendErrorUrl}/error?reason=invalid_oAuthState`,
      );
    } else {
      // Fallback if no frontend URL is configured (critical server misconfiguration)
      Logger.error(
        'CRITICAL: No FRONTEND_WEBSITE_URLS configured for OAuth state validation failure redirect.',
      );
      return res.status(400).json({
        error:
          'OAuth state validation failed and no default frontend URL configured.',
      });
    }
  }

  // The rest of the validation for redirect_url for other error types or success.
  // This redirect_url is specific to the application's own flow, not the OAuth callback itself initially.
  const receivedRedirectUrl = req.session.postLoginRedirectUrl;
  delete req.session.postLoginRedirectUrl;
  const allowedFrontendUrls = (process.env.FRONTEND_WEBSITE_URLS || '')
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  let frontendBaseUrl: string;

  if (
    receivedRedirectUrl &&
    allowedFrontendUrls.includes(receivedRedirectUrl)
  ) {
    frontendBaseUrl = receivedRedirectUrl;
  } else {
    Logger.warn(
      `Invalid or missing redirect_url: '${receivedRedirectUrl}'. Allowed: ${allowedFrontendUrls.join(', ')}`,
    );
    if (allowedFrontendUrls.length > 0) {
      frontendBaseUrl = allowedFrontendUrls[0]; // Default to the first allowed URL
    } else {
      // This is a server misconfiguration or critical error if no allowed URLs are configured.
      Logger.error(
        'CRITICAL: No FRONTEND_WEBSITE_URLS configured for redirection.',
      );
      return res.status(400).json({
        error: 'Invalid redirect URL specified or application misconfigured.',
      });
    }
  }

  // Handle cases where the provider indicates an error (e.g., user denied access)
  if (req.query.error === 'access_denied') {
    // Redirect to an error page on the validated or default frontend URL
    return res.redirect(`${frontendBaseUrl}/error?reason=access_denied`);
  }

  try {
    const key = encrypt(req.query.code as string);
    // Redirect to the login processing page on the validated or default frontend URL
    res.redirect(
      `${frontendBaseUrl}/login/process?provider=${process.env.GITHUB_LOGIN_PROVIDER}&key=${key}`,
    );
  } catch (error) {
    Logger.error('Unable to handle login callback from user: ', error);
    // Redirect to an error page on the validated or default frontend URL in case of other errors
    return res.redirect(
      `${frontendBaseUrl}/error?reason=authentication_callback_failed`,
    );
  }
};

/**
 * Handles login processing by first using the auth code to retrieve the access and refresh token.
 * Following which, use the access token to fetch user data. Tokens and user data are both stored
 * in a redis cache for ease of retrieval
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns user data on success, 401 unauthorized otherwise
 */
const handleLoginProcess = async (req: Request, res: Response) => {
  const sessionId = req.sessionID;
  const provider = req.query.provider as string;

  // if no provider specified, unable to login
  if (!provider) {
    return sendErrorResponse(res, 401, 'Login failed, please try again.');
  }

  // if unable to fetch user tokens, get user to login again
  const tokenResponse = await fetchTokensWithCode(
    sessionId,
    req.query.key as string,
    provider,
  );
  if (!tokenResponse) {
    return sendErrorResponse(res, 401, 'Login failed, please try again.');
  }

  // get user data (will create user if new)
  const userData = await getUserData(sessionId, null, provider);
  if (!userData) {
    return sendErrorResponse(res, 401, 'Login failed, please try again.');
  }

  req.session.regenerate(async (err) => {
    if (err) {
      Logger.error('Error regenerating session:', err);
      // Potentially send an error response here, though the user is technically logged in.
      // For now, we'll log the error and proceed with the success response
      // as the main login functionality was successful.
    }
    // Store session data again after regeneration as regenerate creates a new session
    req.session.provider = provider;
    req.session.userId = userData.id;

    try {
      const tokenSaved = await saveUserTokens(
        req.sessionID,
        userData.id,
        tokenResponse,
      );
      if (!tokenSaved) {
        Logger.error('Failed to save tokens for session', req.sessionID);
        return sendErrorResponse(
          res,
          500,
          'Login partially succeeded, but token storage failed.',
        );
      }
    } catch (e) {
      Logger.error('saveUserTokens threw:', e);
      return sendErrorResponse(
        res,
        500,
        'Login partially succeeded, but token storage failed.',
      );
    }

    return sendSuccessResponse(res, 200, userData, 'Login successful.');
  });
};

/**
 * Handles user logout by clearing cookies.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns user data on success, 401 unauthorized otherwise
 */
const handleLogout = async (req: Request, res: Response) => {
  res.clearCookie('connect.sid');

  req.session.destroy((err) => {
    if (err) {
      return sendErrorResponse(res, 500, err.message);
    }

    return sendSuccessResponse(res, 200, {}, 'Logout successful.');
  });
};

/**
 * Creates and returns a csrf token.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns csrf token
 */
const handleGetCsrfToken = async (req: Request, res: Response) => {
  return res.json({ csrfToken: req.session.csrfToken });
};

/**
 * Handles logging in via github.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns github authorization url
 */
const handleGitHubLogin = async (req: Request, res: Response) => {
  const redirectAfter = req.query.redirect_after as string | undefined;
  if (redirectAfter) {
    req.session.postLoginRedirectUrl = redirectAfter;
  }

  // generate a random state
  const state = randomBytes(16).toString('hex');
  req.session.oAuthState = state;

  // build the redirect URI
  const githubClientId = process.env.GITHUB_APP_CLIENT_ID;
  const redirectUri = `${process.env.API_BASE_URL}/api/${process.env.API_VERSION}/auth/callback?provider=github`;
  const encodedRedirectUri = encodeURIComponent(redirectUri);

  // construct github authorize url
  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${githubClientId}` +
    `&redirect_uri=${encodedRedirectUri}` +
    `&scope=user:email,repo` +
    `&state=${state}`;

  // return authorize url to frontend
  res.json({ authorizationUrl: githubAuthUrl });
};

export {
  handleCallback,
  handleLoginProcess,
  handleLogout,
  handleGetCsrfToken,
  handleGitHubLogin,
};
