import axios from "axios";
import Theme from "../api/databases/sql/models/Theme";
import ThemeJobQueue from "../api/databases/sql/models/ThemeJobQueue";
import ThemeVersion from "../api/databases/sql/models/ThemeVersion";
import { sequelize } from "../api/databases/sql/sql";
import { GitHubRepoContent } from "../api/interfaces/GitHubRepoContent";
import { ThemeMetaData } from "../api/interfaces/ThemeMetaData";

/**
 * Fetch theme folder names (i.e. theme ids) from github.
 *
 * @returns list of theme folder names
 */
const fetchFolders = async (): Promise<string[]> => {
  const repoOwner = "tjtanjin";
  const repoName = "react-chatbotify-themes";
  const path = "themes";

  try {
    const response = await axios.get<GitHubRepoContent[]>(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`,
    );
    const folders = response.data
      .filter((item) => item.type === "dir")
      .map((item) => item.name);

    console.info("Fetched folders:", folders);
    return folders;
  } catch (error) {
    console.error("Error fetching folders from GitHub:", error);
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
const fetchMetaJson = async (
  themeName: string,
): Promise<ThemeMetaData | null> => {
  const url = `https://raw.githubusercontent.com/tjtanjin/react-chatbotify-themes/main/themes/${themeName}/meta.json`;
  try {
    const response = await axios.get<ThemeMetaData>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching meta.json for theme ${themeName}:`, error);
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
      attributes: ["id"],
    });
    const databaseThemeIds = databaseThemes.map((theme) => theme.dataValues.id);

    // fetch all themes from github
    const gitHubThemes = await fetchFolders();

    // fetch theme ids that are in theme job to be created
    const themeJobs = await ThemeJobQueue.findAll({
      attributes: ["id"],
    });
    const themeJobIds = themeJobs.map((job) => job.dataValues.id);

    // delete themes no longer found on github, but exclude those in theme job
    const themesToDelete = databaseThemeIds.filter(
      (id) => !gitHubThemes.includes(id) && !themeJobIds.includes(id),
    );
    if (themesToDelete.length > 0) {
      await Theme.destroy({
        where: {
          id: themesToDelete,
        },
      });
      console.info(`Deleted themes from database: ${themesToDelete}`);
    }

    // create new themes found on github, and update versioning table as well
    const themesToCreate = gitHubThemes.filter(
      (name) => !databaseThemeIds.includes(name),
    );
    for (const themeId of themesToCreate) {
      const transaction = await sequelize.transaction();
      try {
        const metaData = await fetchMetaJson(themeId);
        if (metaData) {
          const newTheme = await Theme.create(
            {
              id: themeId,
              name: metaData.name,
              description: metaData.description,
            },
            { transaction },
          );

          await ThemeVersion.create(
            {
              theme_id: themeId,
              version: metaData.version,
              created_at: sequelize.literal("NOW()"),
            },
            { transaction },
          );

          await transaction.commit();
          console.info(`Created theme and version in database: ${themeId}`);
        } else {
          throw new Error(`Missing meta.json data for theme: ${themeId}`);
        }
      } catch (error) {
        await transaction.rollback();
        console.error(`Failed to create theme ${themeId}: ${error}`);
      }
    }
  } catch (error) {
    console.error("Error fetching themes:", error);
    // todo: send an alert on failure since this is critical?
  }
};

export { runSyncThemesFromGitHub };
