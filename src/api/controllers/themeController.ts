import { Request, Response } from "express";

import { checkIsAdminUser } from "../services/authorization";
import {
	getThemeDataFromCache,
	getThemeSearchFromCache,
	getThemeVersionsFromCache,
	saveThemeDataToCache,
	saveThemeSearchToCache,
	saveThemeVersionsToCache
} from "../services/themes/cacheService";
import {
	addThemeJobToDb,
	deleteThemeDataFromDb,
	getThemeDataFromDb,
	getThemeVersionsFromDb
} from "../services/themes/dbService";
import { getUserFavoriteThemesFromCache, saveUserFavoriteThemesToCache } from "../services/users/cacheService";
import { getUserFavoriteThemesFromDb } from "../services/users/dbService";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responseUtils";
import { Theme } from "../databases/sql/models";
import Logger from "../logger";

/**
 * Handles fetching of themes when not logged in.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of themes on success, 500 error otherwise
 */
const getThemesNoAuth = async (req: Request, res: Response) => {
	// default values for fetching themes
	const searchQuery = req.query.searchQuery as string ?? "";
	const pageNum = parseInt(req.query.pageNum as string) ?? 1;
	const pageSize = parseInt(req.query.pageSize as string) ?? 30;
	const sortBy = req.query.sortBy as string ?? "updatedAt";
	const sortDirection = req.query.sortDirection as "ASC" | "DESC" ?? "DESC";

	try {
		// check if cache contains results and return if so
		let themes;
		const searchResult = await getThemeSearchFromCache(searchQuery, pageNum, pageSize, sortBy, sortDirection);
		if (searchResult) {
			themes = await getThemeDataFromCache(searchResult);
		} else {
			themes = await getThemeDataFromDb(searchQuery, pageNum, pageSize, sortBy, sortDirection);
			saveThemeSearchToCache(searchQuery, pageNum, pageSize, sortBy, sortDirection, themes);
			saveThemeDataToCache(themes);
		}

		sendSuccessResponse(res, 200, themes, "Themes fetched successfully.");
	} catch (error) {
		Logger.error("Error fetching themes:", error);
		sendErrorResponse(res, 500, "Failed to fetch themes.");
	}
};

/**
 * Handles fetching of themes with user-specific favorites (authenticated).
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of themes with `isFavorite` flag on success, 500 error otherwise
 */
const getThemes = async (req: Request, res: Response) => {
	// default values for fetching themes
	const searchQuery = req.query.searchQuery as string ?? "";
	const pageNum = parseInt(req.query.pageNum as string) ?? 1;
	const pageSize = parseInt(req.query.pageSize as string) ?? 30;
	const sortBy = req.query.sortBy as string ?? "updatedAt";
	const sortDirection = req.query.sortDirection as "ASC" | "DESC" ?? "DESC";

	// if no user id, assumed not logged in so handled by public endpoint (though router should have caught it!)
	const userId = req.userData.id;
	if (!userId) {
	  return getThemesNoAuth(req, res);
	}
  
	try {
		// check if cache contains results and return if so ; otherwise fetch from db
		let themes;
		const searchResult = await getThemeSearchFromCache(searchQuery, pageNum, pageSize, sortBy, sortDirection);
		if (searchResult) {
			themes = await getThemeDataFromCache(searchResult);
		} else {
			themes = await getThemeDataFromDb(searchQuery, pageNum, pageSize, sortBy, sortDirection);
			saveThemeSearchToCache(searchQuery, pageNum, pageSize, sortBy, sortDirection, themes);
			saveThemeDataToCache(themes);
		}

		// check if cache contains user favorites and return if so ; otherwise fetch from db
		let userFavorites = await getUserFavoriteThemesFromCache(userId);
		if (userFavorites === null) {
			userFavorites = await getUserFavoriteThemesFromDb(userId);
			saveUserFavoriteThemesToCache(userId, userFavorites);
		}

		// reconcile themes with user favorites
		const themesWithFavorites = themes.map((theme) => ({
			...theme,
			isFavorite: userFavorites.includes(theme.id),
		}));

		sendSuccessResponse(res, 200, themesWithFavorites, "Themes fetched successfully.");
	} catch (error) {
		Logger.error("Error fetching themes with favorites:", error);
		sendErrorResponse(res, 500, "Failed to fetch themes.");
	}
};

/**
 * Retrieves all the published versions for a theme.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of theme versions on success, 500 error otherwise
 */
const getThemeVersions = async (req: Request, res: Response) => {
	const themeId = req.query.themeId as string;
	try {
		// check if cache contains results and return if so ; otherwise fetch from npm
		let versions = await getThemeVersionsFromCache(themeId);
		if (versions === null) {
			versions = await getThemeVersionsFromDb(themeId)
			saveThemeVersionsToCache(themeId, versions);
		}

		sendSuccessResponse(res, 200, versions, "Theme versions fetched successfully.");
	} catch (error) {
		Logger.error("Error fetching theme versions:", error);
		sendErrorResponse(res, 500, "Failed to fetch theme versions.");
	}
};

/**
 * Publishes a new theme (including version bumps).
 * 
 * @param req request from call
 * @param res response to call
 *
 * @returns 201 on success, 500 otherwise
 */
const publishTheme = async (req: Request, res: Response) => {
	const userData = req.userData;

	// plugin information provided by the user
	const { themeId, name, description, version } = req.body;

	// todo: perform checks in the following steps:
	// 1) if themeId already exist and user is not author, 403
	// 2) if themeId already exist and user is author but version already exist, 400
	// 3) if themeId does not exist or user is author of theme but has no existing version, continue below
	// 4) rigorously validate file inputs (styles.json, styles.css, settings.json)
	// 5) if fail checks, immediately return and don't do any further queuing or processing
	// 6) provide verbose reasons for frontend to render to user
	const validationPassed = true;
	if (!validationPassed) {
		// todo: populate array with validation error details in future
		return sendErrorResponse(res, 400, "Failed to publish theme, validation failed.", []);
	}

	// add the new creation to theme job queue for processing later
	try {
		// todo: before adding job to db, should check if there are existing jobs to avoid multiple jobs in the queue
		// todo: frontend should have a status interface to show pending jobs (so that users can delete etc)
		const themeJobQueueEntry = await addThemeJobToDb(themeId, userData.id, name, description, version);
		// todo: increment version count
		// todo: push files into minio bucket with themeId for process queue job to pick up and push to github
		// todo: consume job queue

		sendSuccessResponse(res, 201, themeJobQueueEntry, "Themed queued for publishing.");
	} catch (error) {
		Logger.error("Error publishing theme:", error);
		sendErrorResponse(res, 500, "Failed to publish theme, please try again.");
	}
};

/**
 * Unpublishes an existing theme.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 200 on success, 500 otherwise
 */
const unpublishTheme = async (req: Request, res: Response) => {
	const userData = req.userData;
	const { themeId } = req.params;

	// only admins can unpublish themes
	if (!checkIsAdminUser(userData)) {
		return sendErrorResponse(res, 403, "Unauthorized access.");
	}

	try {
		const theme = await Theme.findOne({
			where: {
				id: themeId,
			}
		});

		// if theme does not exist, cannot delete
		if (!theme) {
			return sendErrorResponse(res, 404, "Failed to unpublish theme, the theme does not exist.");
		}

		await deleteThemeDataFromDb(themeId);

		// todo: add logic for queuing themes to be deleted from github

		sendSuccessResponse(res, 200, theme, "Theme queued for unpublishing.");
	} catch (error) {
		Logger.error("Error unpublishing theme:", error);
		sendErrorResponse(res, 500, "Failed to unpublish theme, please try again.");
	}
};

export {
	getThemes,
	getThemesNoAuth,
	getThemeVersions,
	publishTheme,
	unpublishTheme
};

