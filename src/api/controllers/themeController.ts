import { Request, Response } from "express";
import { Op } from "sequelize";
import FavoriteTheme from "../databases/sql/models/FavoriteTheme";
import Theme from "../databases/sql/models/Theme";
import ThemeJobQueue from "../databases/sql/models/ThemeJobQueue";
import ThemeVersion from "../databases/sql/models/ThemeVersion";
import { redisEphemeralClient } from "../databases/redis";
import Logger from "../logger";
import { checkIsAdminUser } from "../services/authorization";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responseUtils";

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
	const { pageSize = 30, pageNum = 1, searchQuery = "" } = req.query;

	// construct unique cache key for query
	const cacheKey = `${process.env.THEME_CACHE_PREFIX}:page:${pageNum}:size:${pageSize}:query:${searchQuery}`;

	try {
		// check if cache contains results and return if so
		const cachedData = await redisEphemeralClient.get(cacheKey);
		if (cachedData) {
			return sendSuccessResponse(res, 200, JSON.parse(cachedData), "Themes fetched successfully.");
		}

		// construct clause for searching themes
		const limit = parseInt(pageSize as string) || 30;
		const offset = ((parseInt(pageNum as string) || 1) - 1) * limit;
		const whereClause = searchQuery ? {
			[Op.or]: [
				{ name: { [Op.like]: `%${searchQuery}%` } },
				{ description: { [Op.like]: `%${searchQuery}%` } }
			]
		} : {};
	
		// fetch themes according to page size, page num and search query
		const themes = await Theme.findAll({
			where: whereClause,
			limit,
			offset,
		});
	
		// cache the results for 30 mins
		await redisEphemeralClient.set(cacheKey, JSON.stringify(themes), { EX: 1800 });
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
	const { pageSize = 30, pageNum = 1, searchQuery = "" } = req.query;

	// if no user id, assumed not logged in so handled by public endpoint (though routing level should have caught it)
	const userId = req.userData.id;
	if (!userId) {
	  return getThemesNoAuth(req, res);
	}
  
	try {
		const cacheKey = `${process.env.THEME_CACHE_PREFIX}:${userId}:page:${pageNum}:size:${pageSize}:query:${searchQuery}`;
	
		// check if cache contains results and return if so
		const cachedData = await redisEphemeralClient.get(cacheKey);
		if (cachedData) {
			return sendSuccessResponse(res, 200, JSON.parse(cachedData), "Themes fetched successfully.");
		}

		// construct clause for searching themes
		const limit = parseInt(pageSize as string) || 30;
		const offset = ((parseInt(pageNum as string) || 1) - 1) * limit;
		const whereClause = searchQuery ? {
			[Op.or]: [
				{ name: { [Op.like]: `%${searchQuery}%` } },
				{ description: { [Op.like]: `%${searchQuery}%` } },
			]
		} : {};
	
		// fetch themes according to page size, page num and search query
		const themes = (await Theme.findAll({
			where: whereClause,
			limit,
			offset,
			include: [
			{
				model: FavoriteTheme,
				where: { userId },
				required: false,
			},
			],
		})) as (Theme & { FavoriteThemes?: FavoriteTheme[] })[];
		// casting performed above for typescript to include FavoriteThemes property
	
		// Map themes to include isFavorite flag
		const themesWithFavorites = themes.map((theme) => ({
			...theme.toJSON(),
			isFavorite: !!(theme.FavoriteThemes && theme.FavoriteThemes.length > 0),
		}));
	
		// cache the results for 10 mins
		await redisEphemeralClient.set(cacheKey, JSON.stringify(themesWithFavorites), { EX: 600 });
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
	try {
		const versions = await ThemeVersion.findAll({
			where: { themeId: req.query.themeId }
		});

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
		const themeJobQueueEntry = await ThemeJobQueue.create({
			userId: userData.id,
			themeId: themeId,
			name,
			description,
			action: "CREATE"
		});

		// invalidate cache when themes are added
		await redisEphemeralClient.keys(`${process.env.THEME_CACHE_PREFIX}:*`).then((keys) => {
			keys.forEach(async (key) => {
				await redisEphemeralClient.del(key);
			});
		});

		// todo: push files into minio bucket with themeId for process queue job to pick up

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

	// check if the theme exists and is owned by the user
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

		// if theme exist and user is admin, can delete
		const isAdminUser = checkIsAdminUser(userData);
		if (isAdminUser) {
			// todo: allow admins to forcibly unpublish themes
		}

		// invalidate cache when themes are removed
		await redisEphemeralClient.keys(`${process.env.THEME_CACHE_PREFIX}:*`).then((keys) => {
			keys.forEach(async (key) => {
				await redisEphemeralClient.del(key);
			});
		});

		// todo: review how to handle unpublishing of themes, authors should not be allowed to delete themes anytime
		// as there may be existing projects using their themes - perhaps separately have a support system for such action
		return sendErrorResponse(res, 400, "Feature not available yet.");

		// if theme exist but user is not the theme author, cannot delete
		// if (theme.dataValues.userId != req.session.userId) {
		// sendErrorResponse(res, 403, "Failed to unpublish theme, you are not the theme author.");
		// }

		// delete the theme
		// await theme.destroy();

		// sendSuccessResponse(res, 200, theme, "Theme queued for unpublishing.");
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

