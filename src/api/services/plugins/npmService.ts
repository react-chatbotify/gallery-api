import axios from 'axios';

import { PluginData } from '../../interfaces/plugins/PluginData';
import { PluginVersionData } from '../../interfaces/plugins/PluginVersionData';
import { PluginNpmSearchResult } from '../../interfaces/plugins/PluginNpmSearchResult';
import Logger from '../../logger';

const getPluginVersionsFromNpm = async (pluginId: string): Promise<PluginVersionData[]> => {
  // check if plugin is valid
  if (!pluginId || typeof pluginId !== 'string') {
    throw new Error('Invalid plugin ID provided');
  }

  // fetch package data from npm registry
  const response = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(pluginId)}`);

  // validate data
  if (!response.data || !response.data.versions || !response.data.time) {
    throw new Error('Incomplete data received from npm registry');
  }

  // extract and set plugin information
  const versions = Object.keys(response.data.versions);
  const timeData = response.data.time;
  const pluginVersionData: PluginVersionData[] = versions.map((version) => ({
    id: `${pluginId}-${version}`,
    pluginId,
    version,
    createdAt: new Date(timeData[version]),
  }));

  return pluginVersionData;
};

/**
 * Fetch metadata for a specific npm package.
 */
const fetchPackageMeta = async (packageName: string): Promise<PluginData> => {
  const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
  const response = await axios.get(url);
  const packageData = response.data;

  let authorName: string | undefined = undefined;
  if (packageData.author) {
    if (typeof packageData.author === 'string') {
      // Attempt to parse username from "Name <email> (url)" format or just use the string
      const match = packageData.author.match(/^([^<(\s]+)/);
      authorName = match ? match[0] : packageData.author;
    } else if (typeof packageData.author === 'object' && packageData.author.name) {
      authorName = packageData.author.name;
    }
  }

  // If author field is not present, try to get it from maintainers field
  if (!authorName && packageData.maintainers && packageData.maintainers.length > 0) {
    // Taking the first maintainer's name as a fallback
    // Ensure maintainer.name is a string, as it can sometimes be an object (though less common for name)
    if (packageData.maintainers[0] && typeof packageData.maintainers[0].name === 'string') {
      authorName = packageData.maintainers[0].name;
    }
  }

  return { ...packageData, authorName };
};

/**
 * Fetches npm packages tagged with the given keyword from the npm registry.
 *
 * @param tag - The npm keyword tag to filter packages by
 * @returns A list of PluginData objects for all matching packages
 */
const fetchNpmPluginsByTag = async (tag: string): Promise<Partial<PluginData>[]> => {
  // todo: if number of plugins ever grow too large, we need to paginate fetches
  const searchUrl = `https://registry.npmjs.org/-/v1/search?text=keywords:${tag}&size=250`;
  try {
    Logger.info(`Fetching plugins from npm with tag: ${tag} using URL: ${searchUrl}`);
    const response = await axios.get<PluginNpmSearchResult>(searchUrl);
    const packages = response.data.objects;

    if (!packages || packages.length === 0) {
      Logger.info(`No packages found for tag ${tag}.`);
      return [];
    }

    const pluginDataList = await Promise.all(
      packages.map(async (pkg) => {
        // Fetch detailed package metadata to get author information
        const packageMeta = await fetchPackageMeta(pkg.package.name);
        return {
          id: pkg.package.name,
          name: pkg.package.name,
          description: pkg.package.description,
          packageUrl: pkg.package.links.npm,
          authorName: packageMeta.authorName, // Add the authorName
        };
      })
    );

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
    return [];
  }
};

export { getPluginVersionsFromNpm, fetchPackageMeta, fetchNpmPluginsByTag };
