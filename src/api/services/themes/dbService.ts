import { Op } from "sequelize";

import { invalidateThemeDataCache, invalidateThemeSearchCache, invalidateThemeVersionsCache } from "./cacheService";
import { invalidateUserThemeOwnershipCache } from "../users/cacheService";
import { Theme, ThemeJobQueue, ThemeVersion } from "../../databases/sql/models";
import { sequelize } from "../../databases/sql/sql";
import { ThemeData } from "../../interfaces/themes/ThemeData";
import { ThemeVersionData } from "../../interfaces/themes/ThemeVersionData";

/**
 * Retrieves theme data from database for given theme ids.
 *
 * @param pluginIds ids of themes to retrieve data for
 *
 * @returns array of theme data
 */
const getThemesDataByIdsFromDb = async (themeIds: string[]): Promise<ThemeData[]> => {
	if (!themeIds || themeIds.length === 0) {
		return [];
	}

	// Fetch themes corresponding to the given list of theme IDs
	const themes = await Theme.findAll({
		where: {
			id: themeIds
		}
	});

	return themes.map(theme => theme.toJSON());
};

/**
 * Retrieves theme data from database for given search parameters.
 *
 * @param searchQuery query to search for themes
 * @param pageNum page number of themes to retrieve
 * @param pageSize number of themes to retrieve
 *
 * @returns array of theme data
 */
const getThemeDataFromDb = async (searchQuery: string, pageNum: number, pageSize: number): Promise<ThemeData[]> => {
	// construct clause for searching themes
	const limit = pageSize || 30;
	const offset = ((pageNum || 1) - 1) * limit;
	const whereClause = searchQuery ? {
		[Op.or]: [
			{ name: { [Op.like]: `%${searchQuery}%` } },
			{ description: { [Op.like]: `%${searchQuery}%` } }
		]
	} : {};

	// fetch themes according to search query, page num and page size
	const themes = await Theme.findAll({
		where: whereClause,
		limit,
		offset,
	});

	return themes.map(theme => theme.toJSON());
}

/**
 * Retrieves theme versions from database.
 *
 * @param themeId id of theme to retrieve versions for
 *
 * @returns array of theme version data
 */
const getThemeVersionsFromDb = async (themeId: string): Promise<ThemeVersionData[]> => {
	const versions = await ThemeVersion.findAll({
		where: { themeId }
	});

	return versions.map(version => version.toJSON());
};

/**
 * Adds theme job to database (queue for processing later).
 *
 * @param themeId id of theme to add
 * @param userId id of user who owns the theme
 * @param name name of the theme
 * @param description description of the theme
 * @param version current version of the theme
 *
 * @returns theme job queue entry
 */
const addThemeJobToDb = async (themeId: string, userId: string, name: string, description: string, version: string) => {
	const themeJobQueueEntry = await ThemeJobQueue.create({
		themeId,
		userId,
		name,
		description,
		version,
		action: "CREATE"
	});

	return themeJobQueueEntry;
}

/**
 * Deletes theme job from database.
 *
 * @param themeId id of theme to delete job(s) for.
 */
const deleteThemeJobFromDb = async (themeId: string) => {
	await sequelize.transaction(async (transaction) => {
		// check if job exist
		const themeJobQueueEntry = await ThemeJobQueue.findAll({
			where: {
				id: themeId
			},
			transaction
		});

		if (themeJobQueueEntry.length === 0) {
			throw { status: 404, message: "No jobs found." };
		}

		// remove jobs
		await ThemeJobQueue.destroy({
            where: {
                themeId: themeId
            },
            transaction
        });

		return themeJobQueueEntry;
	});
}

/**
 * Adds theme data to database.
 */
const addThemeDataToDb = async () => {
	// todo: fill in the logic - this function should be called by the processing queue job
	// to add theme data to the db **after** files have been successfully pushed to github
}

/**
 * Deletes theme data from database.
 *
 * @param themeId id of theme to delete
 */
const deleteThemeDataFromDb = async (themeId: string) => {
	await sequelize.transaction(async (transaction) => {
		// check if theme exist
		const existingTheme = await Theme.findOne({
			where: {
				id: themeId,
			},
			transaction
		});

		if (!existingTheme) {
			throw { status: 404, message: "Theme not found." };
		}

		// remove theme
		await existingTheme.destroy({ transaction });

		// invalidate cache when a theme is removed
		invalidateThemeSearchCache();
		invalidateThemeDataCache(themeId);
		invalidateThemeVersionsCache(themeId);
		invalidateUserThemeOwnershipCache(existingTheme.dataValues.userId);

		return existingTheme;
	});
}

export {
	getThemesDataByIdsFromDb,
	getThemeDataFromDb,
	getThemeVersionsFromDb,
	addThemeJobToDb,
	deleteThemeJobFromDb,
	addThemeDataToDb,
	deleteThemeDataFromDb,
}