import { FavoritePlugin, FavoriteTheme, Plugin, Theme } from "../../databases/sql/models";
import { sequelize } from "../../databases/sql/sql";

/**
 * Retrieves user favorite themes from database.
 *
 * @param userId id of user to retrieve favorites for
 *
 * @returns array of ids representing user favorite themes
 */
const getUserFavoriteThemesFromDb = async (userId: string): Promise<string[]> => {
	const userFavorites = await FavoriteTheme.findAll({
		where: { userId },
		attributes: ["themeId"]
	});

	return userFavorites.map(userFavorite => userFavorite.dataValues.themeId);
}

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
			throw { status: 404, message: "Theme not found." };
		}

		// check if theme already favorited
		const existingFavorite = await FavoriteTheme.findOne({
			where: {
				userId: userId,
				themeId: themeId
			},
			transaction
		});

		if (existingFavorite) {
			throw { status: 400, message: "Theme already favorited." };
		}

		// add favorite theme
		await FavoriteTheme.create({
			userId: userId,
			themeId: themeId
		}, { transaction });

		// increment the favorites count in the theme table
		await theme.increment("favoritesCount", { by: 1, transaction });
	});
}

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
				themeId: themeId
			},
			transaction
		});

		if (!existingFavorite) {
			throw { status: 404, message: "Favorite theme not found." };
		}

		// remove favorite theme
		await existingFavorite.destroy({ transaction });

		// decrement the favorites count in the theme table
		const theme = await Theme.findByPk(themeId, { transaction });
		if (theme) {
			await theme.decrement("favoritesCount", { by: 1, transaction });
		}
	});
}

/**
 * Retrieves user-owned themes from database.
 *
 * @param userId id of user to retrieve owned themes for
 *
 * @returns array of ids representing user-owned themes
 */
const getUserThemeOwnershipFromDb = async (userId: string): Promise<string[]> => {
	const userOwnedThemes = await Theme.findAll({
		where: { userId },
		attributes: ["themeId"]
	});

	return userOwnedThemes.map(userOwnedTheme => userOwnedTheme.dataValues.themeId);
}

/**
 * Retrieves user favorite plugins from database.
 *
 * @param userId id of user to retrieve favorites for
 *
 * @returns array of ids representing user favorite plugins
 */
const getUserFavoritePluginsFromDb = async (userId: string): Promise<string[]> => {
	const userFavorites = await FavoritePlugin.findAll({
		where: { userId },
		attributes: ["pluginId"]
	});

	return userFavorites.map(userFavorite => userFavorite.dataValues.pluginId);
}

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
			throw { status: 404, message: "Plugin not found." };
		}

		// check if plugin already favorited
		const existingFavorite = await FavoritePlugin.findOne({
			where: {
				userId: userId,
				pluginId: pluginId
			},
			transaction
		});

		if (existingFavorite) {
			throw { status: 400, message: "Plugin already favorited." };
		}

		// add favorite plugin
		await FavoritePlugin.create({
			userId: userId,
			pluginId: pluginId
		}, { transaction });

		// increment the favorites count in the theme table
		await plugin.increment("favoritesCount", { by: 1, transaction });
	});
}

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
				pluginId: pluginId
			},
			transaction
		});

		if (!existingFavorite) {
			throw { status: 404, message: "Favorite plugin not found." };
		}

		// remove favorite plugin
		await existingFavorite.destroy({ transaction });

		// decrement the favorites count in the plugin table
		const plugin = await Plugin.findByPk(pluginId, { transaction });
		if (plugin) {
			await plugin.decrement("favoritesCount", { by: 1, transaction });
		}
	});
}

/**
 * Retrieves user-owned plugins from database.
 *
 * @param userId id of user to retrieve owned plugins for
 *
 * @returns array of ids representing user-owned plugins
 */
const getUserPluginOwnershipFromDb = async (userId: string): Promise<string[]> => {
	const userOwnedPlugins = await Plugin.findAll({
		where: { userId },
		attributes: ["pluginId"]
	});

	return userOwnedPlugins.map(userOwnedPlugin => userOwnedPlugin.dataValues.pluginId);
}

export {
	getUserFavoriteThemesFromDb,
	addUserFavoriteThemeToDb,
	removeUserFavoriteThemeFromDb,
	getUserThemeOwnershipFromDb,
	getUserFavoritePluginsFromDb,
	addUserFavoritePluginToDb,
	removeUserFavoritePluginFromDb,
	getUserPluginOwnershipFromDb,
}