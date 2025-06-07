import { FavoritePlugin, FavoriteTheme, Plugin, Theme } from '../../databases/sql/models';
import { sequelize } from '../../databases/sql/sql';
import { PluginData } from '../../interfaces/plugins/PluginData';
import { ThemeData } from '../../interfaces/themes/ThemeData';
import Logger from '../../logger';
import { invalidatePluginDataCache, invalidatePluginSearchCache } from '../plugins/cacheService';
import { invalidateThemeDataCache, invalidateThemeSearchCache } from '../themes/cacheService';
import { invalidateUserFavoritePluginsCache, invalidateUserFavoriteThemesCache } from './cacheService';

/**
 * Retrieves user favorite themes from database.
 *
 * @param userId id of user to retrieve favorites for
 *
 * @returns array of user favorite themes
 */
const getUserFavoriteThemesFromDb = async (userId: string): Promise<ThemeData[]> => {
  const userFavorites = (await FavoriteTheme.findAll({
    where: { userId },
    include: [
      {
        model: Theme,
        required: true,
      },
    ],
    raw: true,
    nest: true,
  })) as unknown as { Theme: ThemeData }[];

  return userFavorites.map((favorite) => favorite.Theme);
};

/**
 * Adds user favorite theme to database.
 *
 * @param userId id of user for favorite theme
 * @param themeId id of theme favorited
 */
const addUserFavoriteThemeToDb = async (userId: string, themeId: string) => {
  await sequelize.transaction(async (transaction) => {
    // check if the theme exists
    const theme = await Theme.findByPk(themeId, { transaction });
    if (!theme) {
      throw new Error('Theme not found.');
    }

    // check if theme already favorited
    const existingFavorite = await FavoriteTheme.findOne({
      where: {
        userId: userId,
        themeId: themeId,
      },
      transaction,
    });

    if (existingFavorite) {
      throw new Error('Theme already favorited.');
    }

    // add favorite theme
    await FavoriteTheme.create(
      {
        userId: userId,
        themeId: themeId,
      },
      { transaction }
    );

    // invalidate cache asynchronously
    try {
      void invalidateThemeDataCache(themeId);
      void invalidateUserFavoriteThemesCache(userId);

      // todo: this is to ensure favorites sorting is always accurate, but this is not performant
      // should explore better options in future
      void invalidateThemeSearchCache();
    } catch (error) {
      Logger.error('Error invalidating cache:', error);
    }

    // increment the favorites count in the theme table
    await theme.increment('favoritesCount', { by: 1, transaction });
  });
};

/**
 * Removes user favorite theme from database.
 *
 * @param userId id of user to unfavorite theme
 * @param themeId id of theme unfavorited
 */
const removeUserFavoriteThemeFromDb = async (userId: string, themeId: string) => {
  await sequelize.transaction(async (transaction) => {
    // check if theme is favorited
    const existingFavorite = await FavoriteTheme.findOne({
      where: {
        userId: userId,
        themeId: themeId,
      },
      transaction,
    });

    if (!existingFavorite) {
      throw new Error('Favorite theme not found.');
    }

    // remove favorite theme
    await existingFavorite.destroy({ transaction });

    // invalidate cache asynchronously
    try {
      void invalidateThemeDataCache(themeId);
      void invalidateUserFavoriteThemesCache(userId);

      // todo: this is to ensure favorites sorting is always accurate, but this is not performant
      // should explore better options in future
      void invalidateThemeSearchCache();
    } catch (error) {
      Logger.error('Error invalidating cache:', error);
    }

    // decrement the favorites count in the theme table
    const theme = await Theme.findByPk(themeId, { transaction });
    if (theme) {
      await theme.decrement('favoritesCount', { by: 1, transaction });
    }
  });
};

/**
 * Retrieves user-owned themes from database.
 *
 * @param userId id of user to retrieve owned themes for
 *
 * @returns array of ids representing user-owned themes
 */
const getUserOwnedThemesFromDb = async (userId: string): Promise<ThemeData[]> => {
  const userOwnedThemes = (await Theme.findAll({
    where: { userId },
    raw: true,
  })) as unknown as ThemeData[];

  return userOwnedThemes;
};

/**
 * Retrieves user favorite plugins from database.
 *
 * @param userId id of user to retrieve favorites for
 *
 * @returns array of user favorite plugins
 */
const getUserFavoritePluginsFromDb = async (userId: string): Promise<PluginData[]> => {
  const userFavorites = (await FavoritePlugin.findAll({
    where: { userId },
    include: [
      {
        model: Plugin,
        required: true,
      },
    ],
    raw: true,
    nest: true,
  })) as unknown as { Plugin: PluginData }[];

  return userFavorites.map((favorite) => favorite.Plugin);
};

/**
 * Adds user favorite plugin to database.
 *
 * @param userId id of user for favorite plugin
 * @param pluginId id of plugin favorited
 */
const addUserFavoritePluginToDb = async (userId: string, pluginId: string) => {
  await sequelize.transaction(async (transaction) => {
    // check if the plugin exists
    const plugin = await Plugin.findByPk(pluginId, { transaction });
    if (!plugin) {
      throw new Error('Plugin not found.');
    }

    // check if plugin already favorited
    const existingFavorite = await FavoritePlugin.findOne({
      where: {
        userId: userId,
        pluginId: pluginId,
      },
      transaction,
    });

    if (existingFavorite) {
      throw new Error('Plugin already favorited.');
    }

    // add favorite plugin
    await FavoritePlugin.create(
      {
        userId: userId,
        pluginId: pluginId,
      },
      { transaction }
    );

    // invalidate cache asynchronously
    try {
      void invalidatePluginDataCache(pluginId);
      void invalidateUserFavoritePluginsCache(userId);

      // todo: this is to ensure favorites sorting is always accurate, but this is not performant
      // should explore better options in future
      void invalidatePluginSearchCache();
    } catch (error) {
      Logger.error('Error invalidating cache:', error);
    }

    // increment the favorites count in the theme table
    await plugin.increment('favoritesCount', { by: 1, transaction });
  });
};

/**
 * Removes user favorite plugin from database.
 *
 * @param userId id of user to unfavorite plugin
 * @param pluginId id of plugin unfavorited
 */
const removeUserFavoritePluginFromDb = async (userId: string, pluginId: string) => {
  await sequelize.transaction(async (transaction) => {
    // check if plugin is favorited
    const existingFavorite = await FavoritePlugin.findOne({
      where: {
        userId: userId,
        pluginId: pluginId,
      },
      transaction,
    });

    if (!existingFavorite) {
      throw new Error('Favorite plugin not found.');
    }

    // remove favorite plugin
    await existingFavorite.destroy({ transaction });

    // invalidate cache asynchronously
    try {
      void invalidatePluginDataCache(pluginId);
      void invalidateUserFavoritePluginsCache(userId);

      // todo: this is to ensure favorites sorting is always accurate, but this is not performant
      // should explore better options in future
      void invalidatePluginSearchCache();
    } catch (error) {
      Logger.error('Error invalidating cache:', error);
    }

    // decrement the favorites count in the plugin table
    const plugin = await Plugin.findByPk(pluginId, { transaction });
    if (plugin) {
      await plugin.decrement('favoritesCount', { by: 1, transaction });
    }
  });
};

/**
 * Retrieves user-owned plugins from database.
 *
 * @param userId id of user to retrieve owned plugins for
 *
 * @returns array of ids representing user-owned plugins
 */
const getUserOwnedPluginsFromDb = async (userId: string): Promise<PluginData[]> => {
  const userOwnedPlugins = (await Plugin.findAll({
    where: { userId },
    raw: true,
  })) as unknown as PluginData[];

  return userOwnedPlugins;
};

export {
  getUserFavoriteThemesFromDb,
  addUserFavoriteThemeToDb,
  removeUserFavoriteThemeFromDb,
  getUserOwnedThemesFromDb,
  getUserFavoritePluginsFromDb,
  addUserFavoritePluginToDb,
  removeUserFavoritePluginFromDb,
  getUserOwnedPluginsFromDb,
};
