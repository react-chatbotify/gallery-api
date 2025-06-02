import { getThemesDataByIdsFromDb } from "./dbService";
import { redisEphemeralClient } from "../../databases/redis";
import { ThemeData } from "../../interfaces/themes/ThemeData";
import { ThemeVersionData } from "../../interfaces/themes/ThemeVersionData";

const THEME_SEARCH_CACHE_PREFIX = process.env.THEME_SEARCH_CACHE_PREFIX;
const THEME_DATA_CACHE_PREFIX = process.env.THEME_DATA_CACHE_PREFIX;
const THEME_VERSIONS_CACHE_PREFIX = process.env.THEME_VERSIONS_CACHE_PREFIX;

/**
 * Retrieves search results for themes from cache.
 *
 * @param searchQuery search query to construct cache key
 * @param pageNum page num to construct cache key
 * @param pageSize page size to construct cache key
 *
 * @returns array of theme ids if found, null otherwise
 */
const getThemeSearchFromCache = async (
	searchQuery: string,
	pageNum: number,
	pageSize: number,
	sortBy: string,
	sortDirection: string,
) : Promise<string[] | null> => {
	const searchKey = `${THEME_SEARCH_CACHE_PREFIX}:${searchQuery}:${pageNum}:${pageSize}:${sortBy}:${sortDirection}`;

	const cachedIds = await redisEphemeralClient.get(searchKey);
	if (cachedIds === null) {
		return null;
	}

	return JSON.parse(cachedIds);
}

/**
 * Saves search results for themes to cache.
 * 
 * @param searchQuery search query to construct cache key
 * @param pageNum page num to construct cache key
 * @param pageSize page size to construct cache key
 * @param themes themes to save
 */
const saveThemeSearchToCache = async (
	searchQuery: string,
	pageNum: number,
	pageSize: number,
	sortBy: string,
	sortDirection: string,
	themes: ThemeData[]
) => {
	const searchKey = `${THEME_SEARCH_CACHE_PREFIX}:${searchQuery}:${pageNum}:${pageSize}:${sortBy}:${sortDirection}`;
	const themeIds = themes.map(theme => theme.id);
	redisEphemeralClient.set(searchKey, JSON.stringify(themeIds), { EX: 900 });
}

/**
 * Invalidates theme search cache (all).
 */
const invalidateThemeSearchCache = async () => {
	redisEphemeralClient.keys(`${process.env.THEME_SEARCH_CACHE_PREFIX}:*`).then((keys) => {
		keys.forEach(async (key) => {
			await redisEphemeralClient.del(key);
		});
	});
}

/**
 * Retrieves data of themes from cache and for missing data, grab from db.
 *
 * @param themeIds ids of themes to retrieve data for
 *
 * @returns an array of theme data
 */
const getThemeDataFromCache = async (themeIds: string[]): Promise<ThemeData[]> => {
	if (themeIds.length === 0) {
		return [];
	}

	const themeKeys = themeIds.map((id) => `${THEME_DATA_CACHE_PREFIX}:${id}`);
	const rawThemes = await redisEphemeralClient.mGet(themeKeys);
	
	// Identify all missing (null) themes and their corresponding IDs
	const missingThemeIds: string[] = [];
	rawThemes.forEach((data, index) => {
		if (data === null) {
			missingThemeIds.push(themeIds[index]);
		}
	});

	const freshData = missingThemeIds.length > 0 ? await getThemesDataByIdsFromDb(missingThemeIds) : [];
	const freshDataMap = new Map(freshData.map((item) => [item.id, item]));

	// Replace null entries in rawThemes with fresh data
	const themes = rawThemes.map((data, index) => {
		if (data === null) {
			return freshDataMap.get(themeIds[index]) || null;
		}
		return JSON.parse(data);
	});

	return themes;
}

/**
 * Saves data of themes to cache.
 * 
 * @param themes themes to save
 */
const saveThemeDataToCache = async (themes: ThemeData[]) => {
	for (const theme of themes) {
		const dataKey = `${THEME_DATA_CACHE_PREFIX}:${theme.id}`;
		redisEphemeralClient.set(dataKey, JSON.stringify(theme), { EX: 1800 });
	}
}

/**
 * Invalidates a specific theme data.
 * 
 * @param themeId id of theme to invalidate
 */
const invalidateThemeDataCache = async (themeId: string) => {
	const dataKey = `${THEME_DATA_CACHE_PREFIX}:${themeId}`;
	redisEphemeralClient.del(dataKey);
}

/**
 * Retrieves theme versions from cache.
 *
 * @param themeId id of theme to retrieve versions for
 *
 * @returns array of theme versions for given theme
 */
const getThemeVersionsFromCache = async (themeId: string): Promise<ThemeVersionData[] | null> => {
	const versionsKey = `${THEME_VERSIONS_CACHE_PREFIX}:${themeId}`;
	const versions = await redisEphemeralClient.get(versionsKey);
	if (versions === null) {
		return null;
	}

	return JSON.parse(versions);
}

/**
 * Saves theme versions to cache.
 *
 * @param themeId id of theme to save versions for
 * @param versions versions to save
 */
const saveThemeVersionsToCache = async (themeId: string, versions: ThemeVersionData[]) => {
	const versionsKey = `${THEME_VERSIONS_CACHE_PREFIX}:${themeId}`;
	redisEphemeralClient.set(versionsKey, JSON.stringify(versions), { EX: 1800 });
}

/**
 * Invalidates theme versions.
 *
 * @param themeId id of theme to invalidate versions for
 */
const invalidateThemeVersionsCache = async (themeId: string) => {
	const versionsKey = `${THEME_VERSIONS_CACHE_PREFIX}:${themeId}`;
	redisEphemeralClient.del(versionsKey);
}

export {
	getThemeSearchFromCache,
	saveThemeSearchToCache,
	invalidateThemeSearchCache,
	getThemeDataFromCache,
	saveThemeDataToCache,
	invalidateThemeDataCache,
	getThemeVersionsFromCache,
	saveThemeVersionsToCache,
	invalidateThemeVersionsCache,
}
