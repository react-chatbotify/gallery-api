import axios from "axios";

import { PluginVersionData } from "../../interfaces/plugins/PluginVersionData";

const getPluginVersionsFromNpm = async (pluginUrl: string): Promise<PluginVersionData[]> => {
	// Extract the package name from the URL
	const match = pluginUrl.match(/\/package\/(@?[^/]+)/);
	if (!match) {
		throw new Error("Invalid npm package URL");
	}

	const pluginId = decodeURIComponent(match[1]);

	// Fetch package metadata from the npm registry
	const response = await axios.get(`https://registry.npmjs.org/${pluginId}`);

	// Extract the versions and timestamps
	const versions = Object.keys(response.data.versions);
	const timeData = response.data.time;

	// Map the data to PluginVersionData
	const pluginVersionData: PluginVersionData[] = versions.map((version) => ({
		id: `${pluginId}-${version}`,
		pluginId,
		version,
		createdAt: new Date(timeData[version]) // Convert timestamp to Date object
	}));

	return pluginVersionData;
};

export {
	getPluginVersionsFromNpm
}