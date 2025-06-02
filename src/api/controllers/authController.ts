import { Request, Response } from "express";

import { fetchTokensWithCode, getUserData, saveUserTokens } from "../services/authentication/authentication";
import { encrypt } from "../services/cryptoService";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responseUtils";
import Logger from "../logger";

/**
 * Handles the callback when a user authorizes or rejects the application.
 * 
 * @param req request from call
 * @param res response to call
 * 
 * @returns redirects user to login process page on frontend on success, error page otherwise
 */
const handleCallback = async (req: Request, res: Response) => {
	const frontendBaseUrl = req.query.redirect_url;

	// todo: re-direct user to a more specific error page instead of a generic one - need to liase with frontend team
	// todo: note that exact error message may differ based on provider
	if (!frontendBaseUrl || req.query.error === "access_denied") {
		return res.redirect(`${frontendBaseUrl}/error`);
	}

	try {
		const key = encrypt(req.query.code as string);
		res.redirect(`${frontendBaseUrl}/login/process?provider=${process.env.GITHUB_LOGIN_PROVIDER}&key=${key}`);
	} catch (error) {
		Logger.error("Unable to handle login callback from user: ", error);
		// todo: re-direct user to a more specific error page instead of a generic one - need to liase with frontend team
		return res.redirect(`${frontendBaseUrl}/error`);
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
		return sendErrorResponse(res, 401, "Login failed, please try again.");
	}

	// if unable to fetch user tokens, get user to login again 
	const tokenResponse = await fetchTokensWithCode(sessionId, req.query.key as string, provider);
	if (!tokenResponse) {
		return sendErrorResponse(res, 401, "Login failed, please try again.");
	}

	// get user data (will create user if new)
	const userData = await getUserData(sessionId, null, provider);
	if (!userData) {
		return sendErrorResponse(res, 401, "Login failed, please try again.");
	}

	req.session.provider = provider;
	req.session.userId = userData.id;
	saveUserTokens(sessionId, userData.id, tokenResponse);
	return sendSuccessResponse(res, 200, userData, "Login successful.");
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
	res.clearCookie("connect.sid");

	req.session.destroy((err) => {
		if (err) {
			return sendErrorResponse(res, 500, err.message);
		}

		return sendSuccessResponse(res, 200, {}, "Logout successful.");
	})
}

export {
	handleCallback,
	handleLoginProcess,
	handleLogout,
};
