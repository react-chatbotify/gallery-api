import axios from 'axios';
import { Theme } from '../api/databases/sql/models';
import { ThemeJobQueue } from '../api/databases/sql/models';
import { ThemeVersion } from '../api/databases/sql/models';
import { LinkedAuthProvider } from '../api/databases/sql/models';
import { sequelize } from '../api/databases/sql/sql';
import { GitHubRepoContent } from '../api/interfaces/GitHubRepoContent';
import { ThemeMetaData } from '../api/interfaces/themes/ThemeMetaData';
import Logger from '../api/logger';
import { ThemeData } from '../api/interfaces/themes/ThemeData';

/**
 * Fetch theme folder names (i.e. theme ids) from github.
 *
 * @returns list of theme folder names
 */
const fetchFolders = async (): Promise<string[]> => {
  const repoOwner = 'tjtanjin';
  const repoName = 'react-chatbotify-themes';
  const path = 'themes';

  try {
    const response = await axios.get<GitHubRepoContent[]>(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`
    );
    const folders = response.data.filter((item) => item.type === 'dir').map((item) => item.name);

    Logger.info('Fetched folders:', folders);
    return folders;
  } catch (error) {
    Logger.error('Error fetching folders from GitHub:', error);
    return [];
  }
};

/**
 * Fetch meta json file from github for a specified theme.
 *
 * @param themeName theme to fetch meta json file for
 *
 * @returns theme meta data from contents in meta json file
 */
const fetchMetaJson = async (themeName: string): Promise<ThemeMetaData | null> => {
  const url = `https://raw.githubusercontent.com/tjtanjin/react-chatbotify-themes/main/themes/${themeName}/meta.json`;
  try {
    const response = await axios.get<ThemeMetaData>(url);
    return response.data;
  } catch (error) {
    Logger.error(`Error fetching meta.json for theme ${themeName}:`, error);
    return null;
  }
};

/**
 * Runs job to sync themes from github into the application.
 */
const runSyncThemesFromGitHub = async () => {
  try {
    // fetch all themes in database
    const databaseThemes = await Theme.findAll({
      attributes: ['id'],
    });
    const databaseThemeIds: string[] = databaseThemes.map((theme) => theme.dataValues.id);

    // fetch all themes from github
    const gitHubThemes = await fetchFolders();

    // fetch theme ids that are in theme job to be created
    const themeJobs = await ThemeJobQueue.findAll({
      attributes: ['id'],
    });
    const themeJobIds: string[] = themeJobs.map((job) => job.dataValues.id);

    // delete themes no longer found on github, but exclude those in theme job
    const themesToDelete: string[] = databaseThemeIds.filter(
      (id) => !gitHubThemes.includes(id) && !themeJobIds.includes(id)
    );
    if (themesToDelete.length > 0) {
      await Theme.destroy({
        where: {
          id: themesToDelete,
        },
      });
      Logger.info(`Deleted themes from database: ${themesToDelete}`);
    }

    // create new themes found on github, and update versioning table as well
    const themesToCreate = gitHubThemes.filter((name) => !databaseThemeIds.includes(name));
    for (const themeId of themesToCreate) {
      const transaction = await sequelize.transaction();
      try {
        const metaData = await fetchMetaJson(themeId);
        if (metaData) {
          let userIdToLink: string | null = null;

          // attempt to link theme to user id based on github handle if possible
          if (metaData.github) {
            Logger.info(`Attempting to link user for theme: ${themeId} via GitHub username: ${metaData.github}`);
            try {
              const githubUserResponse = await axios.get(`https://api.github.com/users/${metaData.github}`);
              const githubNumericalId = githubUserResponse.data.id;

              if (githubNumericalId) {
                const linkedAuth = await LinkedAuthProvider.findOne({
                  where: {
                    providerUserId: String(githubNumericalId),
                    provider: 'github',
                  },
                  transaction,
                });

                if (linkedAuth) {
                  userIdToLink = linkedAuth.dataValues.userId;
                  Logger.info(`Found linked account for GitHub user ${metaData.github}: User ID ${userIdToLink}`);
                } else {
                  Logger.info(`No linked account found for GitHub user ${metaData.github}`);
                }
              }
            } catch (error) {
              Logger.error(`Error fetching GitHub user ID for ${metaData.github} or finding linked account:`, error);
            }
          }

          const themeData: Partial<ThemeData> = {
            id: themeId,
            name: metaData.name,
            description: metaData.description,
          };

          if (userIdToLink) {
            themeData.userId = userIdToLink;
            Logger.info(`Successfully linked theme ${themeId} to user ${userIdToLink}`);
          } else if (metaData.github) {
            Logger.warn(`No user found to link for theme ${themeId} with GitHub username ${metaData.github}`);
          }

          await Theme.create(themeData, { transaction });

          await ThemeVersion.create(
            {
              themeId: themeId,
              version: metaData.version,
              createdAt: sequelize.literal('NOW()'),
            },
            { transaction }
          );

          await transaction.commit();
          Logger.info(`Created theme and version in database: ${themeId}`);
        } else {
          throw new Error(`Missing meta.json data for theme: ${themeId}`);
        }
      } catch (error: unknown) {
        await transaction.rollback();
        Logger.error(`Failed to create theme ${themeId}: ${error}`);
      }
    }
  } catch (error: unknown) {
    Logger.error('Error fetching themes:', error);
    // todo: send an alert on failure since this is critical?
  }
};

export { runSyncThemesFromGitHub };
