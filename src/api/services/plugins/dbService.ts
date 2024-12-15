import { Op } from "sequelize";

import { invalidatePluginDataCache, invalidatePluginSearchCache, invalidatePluginVersionsCache } from "./cacheService";
import { invalidateUserPluginOwnershipCache } from "../users/cacheService";
import { Plugin } from "../../databases/sql/models";
import { sequelize } from "../../databases/sql/sql";
import { PluginData } from "../../interfaces/plugins/PluginData";

/**
 * Retrieves plugin data from database for given plugin ids.
 *
 * @param pluginIds ids of plugins to retrieve data for
 *
 * @returns array of plugin data
 */
const getPluginsDataByIdsFromDb = async (pluginIds: string[]): Promise<PluginData[]> => {
	if (!pluginIds || pluginIds.length === 0) {
		return [];
	}

	// Fetch plugins corresponding to the given list of plugin IDs
	const plugins = await Plugin.findAll({
		where: {
			id: pluginIds
		}
	});

	return plugins.map(plugin => plugin.toJSON());
};

/**
 * Retrieves plugin data from database for given search parameters.
 *
 * @param searchQuery query to search for plugins
 * @param pageNum page number of plugins to retrieve
 * @param pageSize number of plugins to retrieve
 * @param sortBy column to sort results by
 * @param sortDirection direction to sort
 *
 * @returns array of plugin data
 */
const getPluginDataFromDb = async (
	searchQuery: string,
	pageNum: number,
	pageSize: number,
	sortBy: string = "createdAt",
	sortDirection: "ASC" | "DESC" = "DESC"
):  Promise<PluginData[]> => {
	// construct clause for searching plugins
	const limit = pageSize || 30;
	const offset = ((pageNum || 1) - 1) * limit;
	const whereClause = searchQuery ? {
		[Op.or]: [
			{ name: { [Op.like]: `%${searchQuery}%` } },
			{ description: { [Op.like]: `%${searchQuery}%` } }
		]
	} : {};

	const validSortColumns = ["favoritesCount", "createdAt"];
	const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "createdAt";

	// fetch plugins according to search query, page num, page size and sorting
	const plugins = await Plugin.findAll({
		where: whereClause,
		limit,
		offset,
		order: [[sortColumn, sortDirection]],
	});

	return plugins.map(plugin => plugin.toJSON());
}

/**
 * Adds plugin data to database.
 *
 * @param pluginId id of plugin (unique)
 * @param name name of plugin
 * @param description description of plugin
 * @param imageUrl image url to plugin icon
 * @param packageUrl package url to download plugin
 * @param userId id of user who owns the plugin
 *
 * @returns plugin data
 */
const addPluginDataToDb = async (
	pluginId: string,
	name: string,
	description: string,
	imageUrl: string,
	packageUrl: string,
	userId: string,
) => {
	const plugin = await Plugin.create({
		id: pluginId,
		name,
		description,
		imageUrl,
		packageUrl,
		userId,
	});

	// invalidate cache when a plugin is added
	invalidatePluginSearchCache();
	invalidatePluginDataCache(pluginId);
	invalidatePluginVersionsCache(pluginId);
	invalidateUserPluginOwnershipCache(userId);

	return plugin;
}

/**
 * Deletes plugin data from database.
 *
 * @param pluginId id of plugin to delete
 */
const deletePluginDataFromDb = async (pluginId: string) => {
	await sequelize.transaction(async (transaction) => {
		// check if plugin exist
		const existingPlugin = await Plugin.findOne({
			where: {
				id: pluginId
			},
			transaction
		});

		if (!existingPlugin) {
			throw { status: 404, message: "Plugin not found." };
		}

		// remove plugin
		await existingPlugin.destroy({ transaction });

		// invalidate cache when a plugin is removed
		invalidatePluginSearchCache();
		invalidatePluginDataCache(pluginId);
		invalidatePluginVersionsCache(pluginId);
		invalidateUserPluginOwnershipCache(existingPlugin.dataValues.userId);

		return existingPlugin;
	});
}

export {
	getPluginsDataByIdsFromDb,
	getPluginDataFromDb,
	addPluginDataToDb,
	deletePluginDataFromDb,
}