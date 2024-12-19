import axios from "axios";

import { PluginVersionData } from "../../interfaces/plugins/PluginVersionData";

const getPluginVersionsFromNpm = async (pluginId: string): Promise<PluginVersionData[]> => {
	// check if plugin is valid
	if (!pluginId || typeof pluginId !== "string") {
		throw new Error("Invalid plugin ID provided");
	}

	// fetch package data from npm registry
	const response = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(pluginId)}`);

	// validate data
	if (!response.data || !response.data.versions || !response.data.time) {
		throw new Error("Incomplete data received from npm registry");
	}

	// extract and set plugin information
	const versions = Object.keys(response.data.versions);
	const timeData = response.data.time;
	const pluginVersionData: PluginVersionData[] = versions.map((version) => ({
		id: `${pluginId}-${version}`,
		pluginId,
		version,
		createdAt: new Date(timeData[version])
	}));

	return pluginVersionData;
};

export {
	getPluginVersionsFromNpm
}