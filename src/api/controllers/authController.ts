import { Request, Response } from "express";

import {
  fetchTokensWithCode,
  getUserData,
  saveUserTokens,
} from "../services/authentication/authentication";
import { encrypt } from "../services/cryptoService";

/**
 * Handles the callback when a user authorizes or rejects the application.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns redirects user to login process page on frontend on success, error page otherwise
 */
const handleCallback = async (req: Request, res: Response) => {
  // todo: re-direct user to a more specific error page instead of a generic one - need to liase with frontend team
  if (req.query.error === "access_denied") {
    return res.redirect(`${process.env.FRONTEND_WEBSITE_URL}/error`);
  }
  try {
    const key = encrypt(req.query.code as string);
    res.redirect(
      `${process.env.FRONTEND_WEBSITE_URL}/login/process?provider=${process.env.GITHUB_LOGIN_PROVIDER}&key=${key}`,
    );
  } catch {
    // todo: re-direct user to a more specific error page instead of a generic one - need to liase with frontend team
    return res.redirect(`${process.env.FRONTEND_WEBSITE_URL}/error`);
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
    return res
      .status(401)
      .json({ error: "No login provider found, please try again." });
  }

  // if unable to fetch user tokens, get user to login again
  const tokenResponse = await fetchTokensWithCode(
    sessionId,
    req.query.key as string,
    provider,
  );
  if (!tokenResponse) {
    return res.status(401).json({ error: "Login failed, please try again." });
  }

  // get user data (will create user if new)
  const userData = await getUserData(sessionId, null, provider);
  if (!userData) {
    return res.status(401).json({ error: "Login failed, please try again." });
  }

  req.session.provider = provider;
  req.session.userId = userData.id;
  saveUserTokens(sessionId, userData.id, tokenResponse);
  res.json(userData);
};

export { handleCallback, handleLoginProcess };
