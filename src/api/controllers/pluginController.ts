import { Request, Response } from "express";
import * as crypto from "crypto";

import { checkIsAdminUser } from "../services/authorization";
import { MINIO_URL, uploadBuffer } from "../services/minioService";
import {
	getPluginDataFromCache,
	getPluginSearchFromCache,
	getPluginVersionsFromCache,
	savePluginDataToCache,
	savePluginSearchToCache,
	savePluginVersionsToCache
} from "../services/plugins/cacheService";
import { addPluginDataToDb, deletePluginDataFromDb, getPluginDataFromDb } from "../services/plugins/dbService";
import { getPluginVersionsFromNpm } from "../services/plugins/npmService";
import { getUserFavoritePluginsFromCache, saveUserFavoritePluginsToCache } from "../services/users/cacheService";
import { getUserFavoritePluginsFromDb } from "../services/users/dbService";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responseUtils";
import { Plugin } from "../databases/sql/models";
import Logger from "../logger";

const maxFileSize = Number(process.env.MAX_PLUGIN_IMAGE_FILE_SIZE) || 1 * 1024 * 1024; // defaults to 1 MB if not set

/**
 * Handles fetching of plugins when not logged in.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of plugins on success, 500 error otherwise
 */
const getPluginsNoAuth = async (req: Request, res: Response) => {
	// default values for fetching plugins
	const searchQuery = req.query.searchQuery as string ?? "";
	const pageNum = parseInt(req.query.pageNum as string) ?? 1;
	const requestedPageSize = parseInt(req.query.pageSize as string, 10) || 30;
  	const pageSize = requestedPageSize > 50 ? 50 : requestedPageSize;
	const sortBy = req.query.sortBy as string ?? "updatedAt";
	const sortDirection = req.query.sortDirection as "ASC" | "DESC" ?? "DESC";

	try {
		// check if cache contains results and return if so ; otherwise fetch from db
		let plugins;
		const searchResult = await getPluginSearchFromCache(searchQuery, pageNum, pageSize, sortBy, sortDirection);
		if (searchResult) {
			plugins = await getPluginDataFromCache(searchResult);
		} else {
			plugins = await getPluginDataFromDb(searchQuery, pageNum, pageSize, sortBy, sortDirection);
			savePluginSearchToCache(searchQuery, pageNum, pageSize, sortBy, sortDirection, plugins);
			savePluginDataToCache(plugins);
		}

		sendSuccessResponse(res, 200, plugins, "Plugins fetched successfully.");
	} catch (error) {
		Logger.error("Error fetching plugins:", error);
		sendErrorResponse(res, 500, "Failed to fetch plugins.");
	}
};

/**
 * Handles fetching of plugins with user-specific favorites (authenticated).
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of plugins with `isFavorite` flag on success, 500 error otherwise
 */
const getPlugins = async (req: Request, res: Response) => {
	// default values for fetching plugins
	const searchQuery = req.query.searchQuery as string ?? "";
	const pageNum = parseInt(req.query.pageNum as string) ?? 1;
	const requestedPageSize = parseInt(req.query.pageSize as string, 10) || 30;
  	const pageSize = requestedPageSize > 50 ? 50 : requestedPageSize;
	const sortBy = req.query.sortBy as string ?? "updatedAt";
	const sortDirection = req.query.sortDirection as "ASC" | "DESC" ?? "DESC";

	// if no user id, assumed not logged in so handled by public endpoint (though router should have caught it!)
	const userId = req.userData.id;
	if (!userId) {
	  return getPluginsNoAuth(req, res);
	}
  
	try {
		// check if cache contains results and return if so ; otherwise fetch from db
		let plugins;
		const searchResult = await getPluginSearchFromCache(searchQuery, pageNum, pageSize, sortBy, sortDirection);
		if (searchResult) {
			plugins = await getPluginDataFromCache(searchResult);
		} else {
			plugins = await getPluginDataFromDb(searchQuery, pageNum, pageSize, sortBy, sortDirection);
			savePluginSearchToCache(searchQuery, pageNum, pageSize, sortBy, sortDirection, plugins);
			savePluginDataToCache(plugins);
		}

		// check if cache contains user favorites and return if so ; otherwise fetch from db
		let userFavorites = await getUserFavoritePluginsFromCache(userId);
		if (userFavorites === null) {
			userFavorites = await getUserFavoritePluginsFromDb(userId);
			saveUserFavoritePluginsToCache(userId, userFavorites);
		}
		const userFavoriteIds = new Set(userFavorites.map(item => item.id));

		// reconcile plugins with user favorites
		const pluginsWithFavorites = plugins.map((plugin) => ({
			...plugin,
			isFavorite: userFavoriteIds.has(plugin.id),
		}));

		sendSuccessResponse(res, 200, pluginsWithFavorites, "Plugins fetched successfully.");
	} catch (error) {
		Logger.error("Error fetching plugins with favorites:", error);
		sendErrorResponse(res, 500, "Failed to fetch plugins.");
	}
};

/**
 * Retrieves data for a specific plugin.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns data for specified plugin on success, 404 if not found, and 500 error otherwise
 */
const getPluginById = async (req: Request, res: Response) => {
	try {
		const pluginId = req.params.plugin_id;

		// fetch plugin data from cache (if not found, it automatically pulls from db)
		const result = await getPluginDataFromCache([pluginId]);

		// check if plugin is found
		if (!result) {
			return sendErrorResponse(res, 404, `The plugin ${pluginId} was not found.`);
		}

		const pluginData = result[0];

		if (req.userData) {
			const userId = req.userData.id;
			let userFavorites = await getUserFavoritePluginsFromCache(userId)
			if (userFavorites === null) {
				userFavorites = await getUserFavoritePluginsFromDb(userId);
				saveUserFavoritePluginsToCache(userId, userFavorites);
			}
			const userFavoriteIds = new Set(userFavorites.map(item => item.id));
			pluginData.isFavorite = userFavoriteIds.has(pluginId);
		}

		sendSuccessResponse(res, 200, pluginData, "Plugin data fetched successfully.");
	} catch (error) {
		Logger.error(`Error fetching plugin with id ${req.params.plugin_id}:`, error);
		sendErrorResponse(res, 500, "Failed to fetch plugin data.");
	}
};

/**
 * Retrieves all the published versions for a plugin.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of plugin versions on success, 500 error otherwise
 */
const getPluginVersions = async (req: Request, res: Response) => {
	const pluginId = req.query.pluginId as string;
	try {
		// check if cache contains results and return if so ; otherwise fetch from npm
		let versions = await getPluginVersionsFromCache(pluginId);
		if (versions === null) {
			versions = await getPluginVersionsFromNpm(pluginId)
			savePluginVersionsToCache(pluginId, versions);
		}

		sendSuccessResponse(res, 200, versions, "Plugin versions fetched successfully.");
	} catch (error) {
		Logger.error("Error fetching plugin versions:", error);
		sendErrorResponse(res, 500, "Failed to fetch plugin versions.");
	}
};

/**
 * Publishes a plugin.
 * 
 * @param req request from call
 * @param res response to call
 *
 * @returns plugin information on success, 500 error otherwise
 */
const publishPlugin = async (req: Request, res: Response) => {
	const userData = req.userData;

	// plugin information provided by the user
	const { pluginId, name, description, packageUrl } = req.body;
	const imgFile = (req.files as { [fieldname: string]: Express.Multer.File[] })[
		"imgUrl"
	][0];

	if (imgFile.size > maxFileSize) {
        return sendErrorResponse(res, 400, "Plugin image file size exceeds the 1 MB limit.");
    }

	const [fileName, extension] = imgFile.originalname.split(".");
	const imgName = fileName + crypto.randomBytes(20).toString("hex") + "." + extension;

	try {
		// todo: verify if image upload works
		// save images to minio and generate image url for plugin before saving to db
		await uploadBuffer("plugins-images", imgName, imgFile.buffer);
		const imageUrl = `${MINIO_URL}/plugins-images/${imgName}`;
		const plugin = await addPluginDataToDb(pluginId, name, description, imageUrl, packageUrl, userData.id);
		sendSuccessResponse(res, 200, plugin, "Plugin published successfully.");
	} catch (error) {
		Logger.error("Error publishing plugin.", error);
		sendErrorResponse(res, 500, "Failed to publish plugin, please try again.");
	}
};

/**
 * Unpublishes an existing plugin.
 * 
 * @param req request from call
 * @param res response to call
 *
 * @returns plugin information on success, 500 error otherwise
 */
const unpublishPlugin = async (req: Request, res: Response) => {
	const userData = req.userData;
	const pluginId = req.query.pluginId as string;

	// only admins can unpublish plugins
	if (!checkIsAdminUser(userData)) {
		return sendErrorResponse(res, 403, "Unauthorized access.");
	}

	try {
		const plugin = await Plugin.findOne({
			where: {
				id: pluginId,
			}
		});

		// if plugin does not exist, cannot delete
		if (!plugin) {
			return sendErrorResponse(res, 404, "Failed to unpulish plugin, the plugin does not exist.");
		}

		await deletePluginDataFromDb(pluginId);
		// todo: delete image from minio as well
		sendSuccessResponse(res, 200, plugin, "Plugin unpublished successfully.");
	} catch (error) {
		Logger.error("Error unpublishing plugin.", error);
		sendErrorResponse(res, 500, "Failed to unpublish plugin, please try again.");
	}
};

export {
	getPlugins,
	getPluginsNoAuth,
	getPluginById,
	getPluginVersions,
	publishPlugin,
	unpublishPlugin
};
