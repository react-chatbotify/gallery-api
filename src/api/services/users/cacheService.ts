import { redisEphemeralClient } from "../../databases/redis";
import { PluginData } from "../../interfaces/plugins/PluginData";
import { ThemeData } from "../../interfaces/themes/ThemeData";

const USER_THEME_FAVORITES_CACHE_PREFIX = process.env.USER_THEME_FAVORITES_CACHE_PREFIX;
const USER_THEME_OWNERSHIP_CACHE_PREFIX = process.env.USER_THEME_OWNERSHIP_CACHE_PREFIX;
const USER_PLUGIN_FAVORITES_CACHE_PREFIX = process.env.USER_PLUGIN_FAVORITES_CACHE_PREFIX;
const USER_PLUGIN_OWNERSHIP_CACHE_PREFIX = process.env.USER_PLUGIN_OWNERSHIP_CACHE_PREFIX;

/**
 * Retrieves user's favorite themes from cache.
 *
 * @param userId id of user to retrieve favorite themes for
 *
 * @returns array of theme ids matching user favorite themes
 */
const getUserFavoriteThemesFromCache = async (userId: string): Promise<string[] | null> => {
	const favoritesKey = `${USER_THEME_FAVORITES_CACHE_PREFIX}:${userId}`;
	const themeIds = await redisEphemeralClient.get(favoritesKey);
	if (themeIds === null) {
		return null;
	}

	return JSON.parse(themeIds);
}

/**
 * Saves user favorite themes to cache.
 *
 * @param userId id of user to save favorites for
 * @param themeIds id of favorite themes to save
 */
const saveUserFavoriteThemesToCache = async (userId: string, themeIds: string[]) => {
	const favoritesKey = `${USER_THEME_FAVORITES_CACHE_PREFIX}:${userId}`;
	redisEphemeralClient.set(favoritesKey, JSON.stringify(themeIds), { EX: 1800 });
}

const invalidateUserFavoriteThemesCache = async (userId: string) => {
	const favoritesKey = `${USER_THEME_FAVORITES_CACHE_PREFIX}:${userId}`;
	redisEphemeralClient.del(favoritesKey);
}

/**
 * Retrieves user-owned themes from cache.
 *
 * @param userId id of user to retrieve owned themes for
 *
 * @returns array of theme ids matching user-owned themes
 */
const getUserThemeOwnershipFromCache = async (userId: string) => {
	const ownershipKey = `${USER_THEME_OWNERSHIP_CACHE_PREFIX}:${userId}`;
	const themeIds = await redisEphemeralClient.get(ownershipKey);
	if (themeIds === null) {
		return null;
	}

	return JSON.parse(themeIds);
}

/**
 * Saves user-owned themes to cache.
 *
 * @param userId id of user to save owned themes for
 * @param themes array of owned themes to save
 */
const saveUserThemeOwnershipToCache = async (userId: string, themes: ThemeData[]) => {
	const ownershipKey = `${USER_THEME_OWNERSHIP_CACHE_PREFIX}:${userId}`;
	redisEphemeralClient.set(ownershipKey, JSON.stringify(themes.map(theme => theme.id)), { EX: 1800 });
}

/**
 * Invalidates user owned themes cache.
 *
 * @param userId id of user to invalidate owned themes for
 */
const invalidateUserThemeOwnershipCache = async (userId: string) => {
	const ownershipKey = `${USER_THEME_OWNERSHIP_CACHE_PREFIX}:${userId}`;
	redisEphemeralClient.del(ownershipKey);
}

/**
 * Retrieves user's favorite plugins from cache.
 *
 * @param userId id of user to retrieve favorite plugins for
 *
 * @returns array of theme ids matching user favorite plugins
 */
const getUserFavoritePluginsFromCache = async (userId: string): Promise<string[] | null> => {
	const favoritesKey = `${USER_PLUGIN_FAVORITES_CACHE_PREFIX}:${userId}`;
	const pluginIds = await redisEphemeralClient.get(favoritesKey);
	if (pluginIds === null) {
		return null;
	}

	return JSON.parse(pluginIds);
}

/**
 * Saves user favorite plugins to cache.
 *
 * @param userId id of user to save favorites for
 * @param pluginIds id of favorite plugins to save
 */
const saveUserFavoritePluginsToCache = async (userId: string, pluginIds: string[]) => {
	const favoritesKey = `${USER_PLUGIN_FAVORITES_CACHE_PREFIX}:${userId}`;
	redisEphemeralClient.set(favoritesKey, JSON.stringify(pluginIds), { EX: 1800 });
}

const invalidateUserFavoritePluginsCache = async (userId: string) => {
	const favoritesKey = `${USER_PLUGIN_FAVORITES_CACHE_PREFIX}:${userId}`;
	redisEphemeralClient.del(favoritesKey);
}

/**
 * Retrieves user-owned plugins from cache.
 *
 * @param userId id of user to retrieve owned plugins for
 *
 * @returns array of theme ids matching user-owned plugins
 */
const getUserPluginOwnershipFromCache = async (userId: string) => {
	const ownershipKey = `${USER_PLUGIN_OWNERSHIP_CACHE_PREFIX}:${userId}`;
	const pluginIds = await redisEphemeralClient.get(ownershipKey);
	if (pluginIds === null) {
		return null;
	}

	return JSON.parse(pluginIds);
}

/**
 * Saves user-owned plugins to cache.
 *
 * @param userId id of user to save owned plugins for
 * @param themes array of owned plugins to save
 */
const saveUserPluginOwnershipToCache = async (userId: string, plugins: PluginData[]) => {
	const ownershipKey = `${USER_PLUGIN_OWNERSHIP_CACHE_PREFIX}:${userId}`;
	redisEphemeralClient.set(ownershipKey, JSON.stringify(plugins.map(plugin => plugin.id)), { EX: 1800 });
}

/**
 * Invalidates user owned plugins cache.
 *
 * @param userId id of user to invalidate owned plugins for
 */
const invalidateUserPluginOwnershipCache = async (userId: string) => {
	const ownershipKey = `${USER_PLUGIN_OWNERSHIP_CACHE_PREFIX}:${userId}`;
	redisEphemeralClient.del(ownershipKey);
}

export {
	getUserFavoriteThemesFromCache,
	saveUserFavoriteThemesToCache,
	invalidateUserFavoriteThemesCache,
	getUserThemeOwnershipFromCache,
	saveUserThemeOwnershipToCache,
	invalidateUserThemeOwnershipCache,
	getUserFavoritePluginsFromCache,
	saveUserFavoritePluginsToCache,
	invalidateUserFavoritePluginsCache,
	getUserPluginOwnershipFromCache,
	saveUserPluginOwnershipToCache,
	invalidateUserPluginOwnershipCache,
}