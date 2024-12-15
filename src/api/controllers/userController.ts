import { Request, Response } from "express";

import { checkIsAdminUser } from "../services/authorization";
import { invalidatePluginDataCache } from "../services/plugins/cacheService";
import { invalidateThemeDataCache } from "../services/themes/cacheService";
import {
	getUserFavoritePluginsFromCache,
	getUserFavoriteThemesFromCache,
	getUserThemeOwnershipFromCache,
	invalidateUserFavoritePluginsCache,
	invalidateUserFavoriteThemesCache,
	saveUserFavoritePluginsToCache,
	saveUserFavoriteThemesToCache,
	saveUserThemeOwnershipToCache
} from "../services/users/cacheService";
import {
	addUserFavoritePluginToDb,
	addUserFavoriteThemeToDb,
	getUserFavoritePluginsFromDb,
	getUserFavoriteThemesFromDb,
	getUserThemeOwnershipFromDb,
	removeUserFavoritePluginFromDb,
	removeUserFavoriteThemeFromDb
} from "../services/users/dbService";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responseUtils";
import Logger from "../logger";

/**
 * Retrieves the user profile information (i.e. user data).
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns user data if successful, 403 otherwise
 */
const getUserProfile = async (req: Request, res: Response) => {
	const userData = req.userData;
	const queryUserId = req.query.userId as string;
	const sessionUserId = req.session.userId;

	// if requesting for own data, allow
	if (queryUserId === sessionUserId) {
		return sendSuccessResponse(res, 200, userData, "User data fetched successfully.");
	}

	// if not requesting for own data and requestor is not admin, deny
	if (!checkIsAdminUser(userData)) {
		return sendErrorResponse(res, 403, "Unauthorized access.");
	}

	// todo: add support for admins to get user profile in future
};

/**
 * Retrieves themes belonging to the user.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of user's themes if successful, 403 otherwise
 */
const getUserThemes = async (req: Request, res: Response) => {
	const userData = req.userData;
	const queryUserId = req.query.userId as string;
	const sessionUserId = req.session.userId;

	// if queried user id does not match or requesting user and requesting user is not admin, deny
	if (queryUserId !== sessionUserId && !checkIsAdminUser(userData)) {
		return sendErrorResponse(res, 403, "Unauthorized access.");
	}

	try {
		// check if cache contains user ownership and return if so ; otherwise fetch from db
		let userOwnedThemes = await getUserThemeOwnershipFromCache(queryUserId);
		if (userOwnedThemes === null) {
			userOwnedThemes = await getUserThemeOwnershipFromDb(queryUserId);
			saveUserThemeOwnershipToCache(userData.id, userOwnedThemes);
		}

		return sendSuccessResponse(res, 200, userOwnedThemes, "User owned themes fetched successfully.");
	} catch {
		return sendErrorResponse(res, 500, "Failed to fetch user owned themes.");
	}
};

/**
 * Retrieves themes that user favorited.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of user's favorited themes if successful, 403 otherwise
 */
const getUserFavoriteThemes = async (req: Request, res: Response) => {
	const userData = req.userData;
	const queryUserId = req.query.userId as string;
	const sessionUserId = req.session.userId;

	// if queried user id does not match or requesting user and requesting user is not admin, deny
	if (queryUserId !== sessionUserId && !checkIsAdminUser(userData)) {
		return sendErrorResponse(res, 403, "Unauthorized access.");
	}

	try {
		// check if cache contains user favorites and return if so ; otherwise fetch from db
		let userFavorites = await getUserFavoriteThemesFromCache(queryUserId);
		if (userFavorites === null) {
			userFavorites = await getUserFavoriteThemesFromDb(queryUserId);
			saveUserFavoriteThemesToCache(queryUserId, userFavorites);
		}

		return sendSuccessResponse(res, 200, userFavorites, "User favorite themes fetched successfully.");
	} catch {
		return sendErrorResponse(res, 500, "Failed to fetch user favorite themes.");
	}
};

/**
 * Adds a theme to user favorite.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 201 if successful, 404 if theme not found, 400 if already favorited, 500 otherwise
 */
const addUserFavoriteTheme = async (req: Request, res: Response) => {
	const userData = req.userData;
	const { themeId } = req.body;

	try {
		await addUserFavoriteThemeToDb(userData.id, themeId);
		invalidateThemeDataCache(themeId);
		invalidateUserFavoriteThemesCache(userData.id);
		sendSuccessResponse(res, 201, {}, "Added theme to favorites successfully.");
	} catch (error) {
		Logger.error("Error adding favorite theme:", error);
		sendErrorResponse(res, 500, "Failed to add favorite theme.");
	}
};

/**
 * Removes a theme from user favorite.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 200 if successful, 404 if theme not found, 500 otherwise
 */
const removeUserFavoriteTheme = async (req: Request, res: Response) => {
	const userData = req.userData;
	const themeId = req.query.themeId as string;

	try {
		removeUserFavoriteThemeFromDb(userData.id, themeId);
		invalidateThemeDataCache(themeId);
		invalidateUserFavoriteThemesCache(userData.id);
		sendSuccessResponse(res, 200, {}, "Removed theme from favorites successfully.");
	} catch (error) {
		Logger.error("Error removing favorite theme:", error);
		sendErrorResponse(res, 500, "Failed to remove favorite theme.");
	}
};

/**
 * Retrieves plugins that user favorited.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of user's favorited plugins if successful, 403 otherwise
 */
const getUserFavoritePlugins = async (req: Request, res: Response) => {
	const userData = req.userData;
	const queryUserId = req.query.userId as string;
	const sessionUserId = req.session.userId;

	// if queried user id does not match or requesting user and requesting user is not admin, deny
	if (queryUserId !== sessionUserId && !checkIsAdminUser(userData)) {
		return sendErrorResponse(res, 403, "Unauthorized access.");
	}

	try {
		// check if cache contains user favorites and return if so ; otherwise fetch from db
		let userFavorites = await getUserFavoritePluginsFromCache(queryUserId);
		if (userFavorites === null) {
			userFavorites = await getUserFavoritePluginsFromDb(queryUserId);
			saveUserFavoritePluginsToCache(queryUserId, userFavorites);
		}

		return sendSuccessResponse(res, 200, userFavorites, "User favorite plugins fetched successfully.");
	} catch {
		return sendErrorResponse(res, 500, "Failed to fetch user favorite plugins.");
	}
};

/**
 * Adds a plugin to user favorite.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 201 if successful, 404 if theme not found, 400 if already favorited, 500 otherwise
 */
const addUserFavoritePlugin = async (req: Request, res: Response) => {
	const userData = req.userData;
	const { pluginId } = req.body;

	try {
		addUserFavoritePluginToDb(userData.id, pluginId);
		invalidatePluginDataCache(pluginId);
		invalidateUserFavoritePluginsCache(userData.id);
		sendSuccessResponse(res, 201, {}, "Added plugin to favorites successfully.");
	} catch (error) {
		Logger.error("Error adding favorite plugin:", error);
		sendErrorResponse(res, 500, "Failed to add favorite plugin.");
	}
};

/**
 * Removes a plugin from user favorite.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 200 if successful, 404 if theme not found, 500 otherwise
 */
const removeUserFavoritePlugin = async (req: Request, res: Response) => {
	const userData = req.userData;
	const { pluginId } = req.params;

	try {
		removeUserFavoritePluginFromDb(userData.id, pluginId);
		invalidatePluginDataCache(pluginId);
		invalidateUserFavoritePluginsCache(userData.id);
		sendSuccessResponse(res, 200, {}, "Removed plugin from favorites successfully.");
	} catch (error) {
		Logger.error("Error removing favorite plugin:", error);
		sendErrorResponse(res, 500, "Failed to remove favorite plugin.");
	}
};

export {
	addUserFavoritePlugin,
	addUserFavoriteTheme,
	getUserFavoritePlugins,
	getUserFavoriteThemes,
	getUserProfile,
	getUserThemes,
	removeUserFavoritePlugin,
	removeUserFavoriteTheme
};
