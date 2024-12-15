// theme data retrieved from theme meta data (i.e. github meta.json)
interface ThemeMetaData {
	name: string;
	description: string;
	author: string;
	github: string;
	tags: string[];
	version: string;
}

export {
	ThemeMetaData
};
