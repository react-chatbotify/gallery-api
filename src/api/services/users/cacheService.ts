import { redisEphemeralClient } from '../../databases/redis';
import { PluginData } from '../../interfaces/plugins/PluginData';
import { ThemeData } from '../../interfaces/themes/ThemeData';
import { getPluginDataFromCache } from '../plugins/cacheService';
import { getThemeDataFromCache } from '../themes/cacheService';

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
const getUserFavoriteThemesFromCache = async (userId: string): Promise<ThemeData[] | null> => {
  const favoritesKey = `${USER_THEME_FAVORITES_CACHE_PREFIX}:${userId}`;
  const themeIds = await redisEphemeralClient.get(favoritesKey);
  if (themeIds === null) {
    return null;
  }

  return getThemeDataFromCache(JSON.parse(themeIds));
};

/**
 * Saves user favorite themes to cache.
 *
 * @param userId id of user to save favorites for
 * @param themes user favorited themes to save
 */
const saveUserFavoriteThemesToCache = (userId: string, themes: ThemeData[]) => {
  const favoritesKey = `${USER_THEME_FAVORITES_CACHE_PREFIX}:${userId}`;
  void redisEphemeralClient.set(favoritesKey, JSON.stringify(themes.map((theme) => theme.id)), { EX: 1800 });
};

/**
 * Invalidates user favorite themes cache.
 *
 * @param userId id of user to invalidate favorite themes for
 */
const invalidateUserFavoriteThemesCache = (userId: string) => {
  const favoritesKey = `${USER_THEME_FAVORITES_CACHE_PREFIX}:${userId}`;
  void redisEphemeralClient.del(favoritesKey);
};

/**
 * Retrieves user-owned themes from cache.
 *
 * @param userId id of user to retrieve owned themes for
 *
 * @returns array of theme ids matching user-owned themes
 */
const getUserOwnedThemesFromCache = async (userId: string): Promise<ThemeData[] | null> => {
  const ownershipKey = `${USER_THEME_OWNERSHIP_CACHE_PREFIX}:${userId}`;
  const themeIds = await redisEphemeralClient.get(ownershipKey);
  if (themeIds === null) {
    return null;
  }

  return getThemeDataFromCache(JSON.parse(themeIds));
};

/**
 * Saves user-owned themes to cache.
 *
 * @param userId id of user to save owned themes for
 * @param themes user owned themes to save
 */
const saveUserOwnedThemesToCache = (userId: string, themes: ThemeData[]) => {
  const ownershipKey = `${USER_THEME_OWNERSHIP_CACHE_PREFIX}:${userId}`;
  void redisEphemeralClient.set(ownershipKey, JSON.stringify(themes.map((theme) => theme.id)), { EX: 1800 });
};

/**
 * Invalidates user owned themes cache.
 *
 * @param userId id of user to invalidate owned themes for
 */
const invalidateUserOwnedThemesCache = (userId: string) => {
  const ownershipKey = `${USER_THEME_OWNERSHIP_CACHE_PREFIX}:${userId}`;
  void redisEphemeralClient.del(ownershipKey);
};

/**
 * Retrieves user's favorite plugins from cache.
 *
 * @param userId id of user to retrieve favorite plugins for
 *
 * @returns array of theme ids matching user favorite plugins
 */
const getUserFavoritePluginsFromCache = async (userId: string): Promise<PluginData[] | null> => {
  const favoritesKey = `${USER_PLUGIN_FAVORITES_CACHE_PREFIX}:${userId}`;
  const pluginIds = await redisEphemeralClient.get(favoritesKey);
  if (pluginIds === null) {
    return null;
  }

  return getPluginDataFromCache(JSON.parse(pluginIds));
};

/**
 * Saves user favorite plugins to cache.
 *
 * @param userId id of user to save favorites for
 * @param plugins user favorite plugins to save
 */
const saveUserFavoritePluginsToCache = (userId: string, plugins: PluginData[]) => {
  const favoritesKey = `${USER_PLUGIN_FAVORITES_CACHE_PREFIX}:${userId}`;
  void redisEphemeralClient.set(favoritesKey, JSON.stringify(plugins.map((plugin) => plugin.id)), { EX: 1800 });
};

/**
 * Invalidates user favorite plugins cache.
 *
 * @param userId id of user to invalidate favorite plugins for
 */
const invalidateUserFavoritePluginsCache = (userId: string) => {
  const favoritesKey = `${USER_PLUGIN_FAVORITES_CACHE_PREFIX}:${userId}`;
  void redisEphemeralClient.del(favoritesKey);
};

/**
 * Retrieves user-owned plugins from cache.
 *
 * @param userId id of user to retrieve owned plugins for
 *
 * @returns array of plugin ids matching user-owned plugins
 */
const getUserOwnedPluginsFromCache = async (userId: string): Promise<PluginData[] | null> => {
  const ownershipKey = `${USER_PLUGIN_OWNERSHIP_CACHE_PREFIX}:${userId}`;
  const pluginIds = await redisEphemeralClient.get(ownershipKey);
  if (pluginIds === null) {
    return null;
  }

  return getPluginDataFromCache(JSON.parse(pluginIds));
};

/**
 * Saves user-owned plugins to cache.
 *
 * @param userId id of user to save owned plugins for
 * @param themes user owned plugins to save
 */
const saveUserOwnedPluginsToCache = (userId: string, plugins: PluginData[]) => {
  const ownershipKey = `${USER_PLUGIN_OWNERSHIP_CACHE_PREFIX}:${userId}`;
  void redisEphemeralClient.set(ownershipKey, JSON.stringify(plugins.map((plugin) => plugin.id)), { EX: 1800 });
};

/**
 * Invalidates user owned plugins cache.
 *
 * @param userId id of user to invalidate owned plugins for
 */
const invalidateUserOwnedPluginsCache = (userId: string) => {
  const ownershipKey = `${USER_PLUGIN_OWNERSHIP_CACHE_PREFIX}:${userId}`;
  void redisEphemeralClient.del(ownershipKey);
};

export {
  getUserFavoriteThemesFromCache,
  saveUserFavoriteThemesToCache,
  invalidateUserFavoriteThemesCache,
  getUserOwnedThemesFromCache,
  saveUserOwnedThemesToCache,
  invalidateUserOwnedThemesCache,
  getUserFavoritePluginsFromCache,
  saveUserFavoritePluginsToCache,
  invalidateUserFavoritePluginsCache,
  getUserOwnedPluginsFromCache,
  saveUserOwnedPluginsToCache,
  invalidateUserOwnedPluginsCache,
};
