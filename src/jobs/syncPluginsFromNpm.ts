import axios from 'axios';
import Plugin from '../api/databases/sql/models/Plugin';
import { sequelize } from '../api/databases/sql/sql';
import Logger from '../api/logger';
import { PluginData } from '../api/interfaces/plugins/PluginData';

// todo: move into standalone interface
interface NpmRegistrySearchResult {
  objects: {
    package: {
      name: string;
      description?: string;
      links: {
        npm: string;
      };
      version: string;
    };
  }[];
}

/**
 * Fetches npm packages tagged with the given keyword from the npm registry.
 *
 * @param tag - The npm keyword tag to filter packages by
 * @returns A list of PluginData objects for all matching packages
 */
const fetchNpmPluginsByTag = async (tag: string): Promise<Partial<PluginData>[]> => {
  const searchUrl = `https://registry.npmjs.org/-/v1/search?text=keywords:${tag}&size=250`;
  try {
    Logger.info(`Fetching plugins from npm with tag: ${tag} using URL: ${searchUrl}`);
    const response = await axios.get<NpmRegistrySearchResult>(searchUrl);
    const packages = response.data.objects;

    if (!packages || packages.length === 0) {
      Logger.info(`No packages found for tag ${tag}.`);
      return [];
    }

    const pluginDataList = packages.map((pkg) => ({
      id: pkg.package.name, // Using NPM package name as plugin ID
      name: pkg.package.name,
      description: pkg.package.description,
      packageUrl: pkg.package.links.npm,
      version: pkg.package.version,
    }));

    Logger.info(`Fetched ${pluginDataList.length} plugins for tag ${tag}.`);
    return pluginDataList;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      Logger.error(`Error fetching plugins from npm for tag ${tag}: ${error.message}`, {
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      Logger.error(`An unexpected error occurred while fetching plugins from npm for tag ${tag}: ${error}`);
    }
    return []; // Return empty array on error
  }
};

/**
 * Runs job to synchronize plugins between the npm registry and the local database.
 *
 * - Deletes any plugins in the DB no longer present on npm under the specified tag
 * - Creates new plugin entries for packages newly added to npm
 * - Updates existing DB records when name, description, or URL have changed
 */
const runSyncPluginsFromNpm = async () => {
  Logger.info('Plugin sync job started...');
  const NPM_PLUGIN_TAG = 'react-chatbotify-plugin'; // Define the tag to search for

  try {
    // Fetch all plugin details from the database for comparison
    const dbPlugins = await Plugin.findAll({
      attributes: ['id', 'name', 'description', 'packageUrl'], // Fetch only necessary fields
    });
    // Create a Map for quick lookups of database plugins by their ID
    const dbPluginMap = new Map(dbPlugins.map((p) => [p.dataValues.id, p.dataValues]));
    Logger.info(`Found ${dbPluginMap.size} plugins in the database.`);

    // Fetch all plugins from npm with the specified tag
    const npmPlugins = await fetchNpmPluginsByTag(NPM_PLUGIN_TAG);
    // Create a Map for quick lookups of npm plugins by their ID
    const npmPluginMap = new Map(npmPlugins.map((p) => [p.id, p]));
    Logger.info(`Found ${npmPluginMap.size} plugins on npm with tag "${NPM_PLUGIN_TAG}".`);

    // Identify plugins to delete (present in DB but not in the latest npm list for the tag)
    const pluginsToDelete: string[] = [];
    for (const dbPluginId of dbPluginMap.keys()) {
      if (!npmPluginMap.has(dbPluginId)) {
        pluginsToDelete.push(dbPluginId);
      }
    }

    if (pluginsToDelete.length > 0) {
      await Plugin.destroy({
        where: {
          id: pluginsToDelete,
        },
      });
      Logger.info(`Deleted ${pluginsToDelete.length} plugins from database: ${pluginsToDelete.join(', ')}`);
    } else {
      Logger.info('No plugins to delete from the database.');
    }

    // Identify plugins to create or update
    for (const [npmPluginId, npmPluginData] of npmPluginMap.entries()) {
      const existingDbPlugin = dbPluginMap.get(npmPluginId);
      const transaction = await sequelize.transaction(); // Start a transaction for each operation

      try {
        if (!existingDbPlugin) {
          // Plugin exists in npm but not in DB -> Create
          await Plugin.create(
            {
              id: npmPluginData.id,
              name: npmPluginData.name,
              description: npmPluginData.description,
              packageUrl: npmPluginData.packageUrl,
              // imageUrl and userId are not available from npm search directly, rely on model defaults or null
              // favoritesCount defaults to 0 as per model definition
            },
            { transaction }
          );
          Logger.info(`Created new plugin in database: ${npmPluginData.id}`);
        } else {
          // Plugin exists in both DB and npm -> Check for updates
          const needsUpdate =
            existingDbPlugin.name !== npmPluginData.name ||
            existingDbPlugin.description !== npmPluginData.description ||
            existingDbPlugin.packageUrl !== npmPluginData.packageUrl;

          if (needsUpdate) {
            await Plugin.update(
              {
                name: npmPluginData.name,
                description: npmPluginData.description,
                packageUrl: npmPluginData.packageUrl,
                updatedAt: new Date(), // Explicitly set updatedAt
              },
              {
                where: { id: npmPluginData.id },
                transaction,
              }
            );
            Logger.info(`Updated plugin in database: ${npmPluginData.id}`);
          }
        }
        await transaction.commit(); // Commit transaction if successful
      } catch (error) {
        await transaction.rollback(); // Rollback transaction on error
        Logger.error(
          `Failed to create/update plugin ${npmPluginData.id}: ${error instanceof Error ? error.message : String(error)}`,
          { pluginData: npmPluginData }
        );
      }
    }
    Logger.info('Plugin sync job finished successfully.');
  } catch (error) {
    Logger.error(`Error during plugin sync job: ${error instanceof Error ? error.message : String(error)}`, {
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Consider sending an alert on failure (e.g., via an external monitoring service)
  }
};

export { runSyncPluginsFromNpm, fetchNpmPluginsByTag };
