import { getPluginsDataByIdsFromDb } from "./dbService";
import { redisEphemeralClient } from "../../databases/redis";
import { PluginData } from "../../interfaces/plugins/PluginData";
import { PluginVersionData } from "../../interfaces/plugins/PluginVersionData";

const PLUGIN_SEARCH_CACHE_PREFIX = process.env.PLUGIN_SEARCH_CACHE_PREFIX;
const PLUGIN_DATA_CACHE_PREFIX = process.env.PLUGIN_DATA_CACHE_PREFIX;
const PLUGIN_VERSIONS_CACHE_PREFIX = process.env.PLUGIN_VERSIONS_CACHE_PREFIX;

/**
 * Retrieves search results for plugins from cache.
 *
 * @param searchQuery search query to construct cache key
 * @param pageNum page num to construct cache key
 * @param pageSize page size to construct cache key
 *
 * @returns array of plugin ids if found, null otherwise
 */
const getPluginSearchFromCache = async (
	searchQuery: string,
	pageNum: number,
	pageSize: number,
	sortBy: string,
	sortDirection: string,
) : Promise<string[] | null> => {
	const searchKey = `${PLUGIN_SEARCH_CACHE_PREFIX}:${searchQuery}:${pageNum}:${pageSize}:${sortBy}:${sortDirection}`;

	const cachedIds = await redisEphemeralClient.get(searchKey);
	if (cachedIds === null) {
		return null;
	}

	return JSON.parse(cachedIds);
}

/**
 * Saves search results for plugins to cache.
 * 
 * @param searchQuery search query to construct cache key
 * @param pageNum page num to construct cache key
 * @param pageSize page size to construct cache key
 * @param plugins plugins to save
 */
const savePluginSearchToCache = async (
	searchQuery: string,
	pageNum: number,
	pageSize: number,
	sortBy: string,
	sortDirection: string,
	plugins: PluginData[]
) => {
	const searchKey = `${PLUGIN_SEARCH_CACHE_PREFIX}:${searchQuery}:${pageNum}:${pageSize}:${sortBy}:${sortDirection}`;
	const pluginIds = plugins.map(plugin => plugin.id);
	redisEphemeralClient.set(searchKey, JSON.stringify(pluginIds), { EX: 900 });
}

/**
 * Invalidates plugin search cache (all).
 */
const invalidatePluginSearchCache = async () => {
	redisEphemeralClient.keys(`${process.env.PLUGIN_SEARCH_CACHE_PREFIX}:*`).then((keys) => {
		keys.forEach(async (key) => {
			await redisEphemeralClient.del(key);
		});
	});
}

/**
 * Retrieves data of plugins from cache.
 *
 * @param pluginIds ids of plugins to retrieve data for
 *
 * @returns an array of plugin data
 */
const getPluginDataFromCache = async (pluginIds: string[]): Promise<PluginData[]> => {
	const pluginKeys = pluginIds.map((id) => `${PLUGIN_DATA_CACHE_PREFIX}:${id}`);
	const rawPlugins = await redisEphemeralClient.mGet(pluginKeys);
	
	// Identify all missing (null) plugins and their corresponding IDs
	const missingPluginIds: string[] = [];
	rawPlugins.forEach((data, index) => {
		if (data === null) {
			missingPluginIds.push(pluginIds[index]);
		}
	});

	const freshData = missingPluginIds.length > 0 ? await getPluginsDataByIdsFromDb(missingPluginIds) : [];
	const freshDataMap = new Map(freshData.map((item) => [item.id, item]));

	// Replace null entries in rawPlugins with fresh data
	const plugins = rawPlugins.map((data, index) => {
		if (data === null) {
			return freshDataMap.get(pluginIds[index]) || null;
		}
		return JSON.parse(data);
	});

	return plugins;
}

/**
 * Saves data of plugins to cache.
 * 
 * @param plugins plugins to save
 */
const savePluginDataToCache = async (plugins: PluginData[]) => {
	for (const plugin of plugins) {
		const dataKey = `${PLUGIN_DATA_CACHE_PREFIX}:${plugin.id}`;
		redisEphemeralClient.set(dataKey, JSON.stringify(plugin), { EX: 1800 });
	}
}

/**
 * Invalidates a specific plugin data.
 * 
 * @param themeId id of plugin to invalidate
 */
const invalidatePluginDataCache = async (pluginId: string) => {
	const dataKey = `${PLUGIN_DATA_CACHE_PREFIX}:${pluginId}`;
	redisEphemeralClient.del(dataKey);
}

/**
 * Retrieves plugin versions from cache.
 *
 * @param themeId id of plugin to retrieve versions for
 *
 * @returns array of plugin versions for given plugin
 */
const getPluginVersionsFromCache = async (pluginId: string): Promise<PluginVersionData[] | null> => {
	const versionsKey = `${PLUGIN_VERSIONS_CACHE_PREFIX}:${pluginId}`;
	const versions = await redisEphemeralClient.get(versionsKey);
	if (versions === null) {
		return null;
	}

	return JSON.parse(versions);
}

/**
 * Saves plugin versions to cache.
 *
 * @param themeId id of plugin to save versions for
 * @param versions versions to save
 */
const savePluginVersionsToCache = async (pluginId: string, versions: PluginVersionData[]) => {
	const versionsKey = `${PLUGIN_VERSIONS_CACHE_PREFIX}:${pluginId}`;
	redisEphemeralClient.set(versionsKey, JSON.stringify(versions), { EX: 1800 });
}

/**
 * Invalidates plugin versions.
 *
 * @param themeId id of plugin to invalidate versions for
 */
const invalidatePluginVersionsCache = async (pluginId: string) => {
	const versionsKey = `${PLUGIN_VERSIONS_CACHE_PREFIX}:${pluginId}`;
	redisEphemeralClient.del(versionsKey);
}

export {
	getPluginSearchFromCache,
	savePluginSearchToCache,
	invalidatePluginSearchCache,
	getPluginDataFromCache,
	savePluginDataToCache,
	invalidatePluginDataCache,
	getPluginVersionsFromCache,
	savePluginVersionsToCache,
	invalidatePluginVersionsCache,
}
