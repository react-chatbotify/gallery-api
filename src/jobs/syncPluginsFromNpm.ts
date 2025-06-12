import axios from 'axios';
import Plugin from '../api/databases/sql/models/Plugin';
import LinkedAuthProvider from '../api/databases/sql/models/LinkedAuthProvider';
import { sequelize } from '../api/databases/sql/sql';
import Logger from '../api/logger';
import { fetchNpmPluginsByTag } from '../api/services/plugins/npmService';
import { PluginData } from '../api/interfaces/plugins/PluginData';

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

    // todo: revisit plugin deletion logic
    // for (const dbPluginId of dbPluginMap.keys()) {
    //   if (!npmPluginMap.has(dbPluginId)) {
    //     pluginsToDelete.push(dbPluginId);
    //   }
    // }

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
          const pluginCreateData: Partial<PluginData> = {
            id: npmPluginData.id,
            name: npmPluginData.name,
            description: npmPluginData.description,
            packageUrl: npmPluginData.packageUrl,
          };

          if (npmPluginData.authorName) {
            try {
              // Fetch GitHub user ID from GitHub API
              const githubUserResponse = await axios.get(`https://api.github.com/users/${npmPluginData.authorName}`);
              const githubUserId = githubUserResponse.data.id;

              if (githubUserId) {
                // Find LinkedAuthProvider entry
                const linkedAuth = await LinkedAuthProvider.findOne({
                  where: {
                    providerKey: 'github',
                    providerUserId: githubUserId.toString(), // Ensure it's a string for comparison
                  },
                  transaction, // Include transaction in query
                });

                if (linkedAuth) {
                  pluginCreateData.userId = linkedAuth.dataValues.userId;
                  Logger.info(
                    `Linking plugin ${npmPluginData.id} to user ${pluginCreateData.userId} via author name ${npmPluginData.authorName} (GitHub ID: ${githubUserId})`
                  );
                } else {
                  Logger.info(
                    `No LinkedAuthProvider found for author name ${npmPluginData.authorName} (GitHub ID: ${githubUserId})`
                  );
                }
              }
            } catch (githubError) {
              if (axios.isAxiosError(githubError) && githubError.response?.status === 404) {
                Logger.warn(
                  `GitHub user not found for author name ${npmPluginData.authorName}. Plugin ${npmPluginData.id} will be created without a user link.`
                );
              } else {
                Logger.error(
                  `Error fetching GitHub user ID for ${npmPluginData.authorName}: ${githubError instanceof Error ? githubError.message : String(githubError)}`
                );
              }
              // Continue creating the plugin without a user link if GitHub lookup fails
            }
          }

          await Plugin.create(pluginCreateData, { transaction });
          Logger.info(
            `Created new plugin in database: ${npmPluginData.id}${pluginCreateData.userId ? ` and linked to user ${pluginCreateData.userId}` : ''}`
          );
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
