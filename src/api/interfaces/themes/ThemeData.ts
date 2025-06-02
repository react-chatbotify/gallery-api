// theme data stored in the backend
interface ThemeData {
	id: string;
	name: string;
	description: string;
	favoritesCount: number;
	versionsCount: number;
	isFavorite?: boolean;
}

export {
	ThemeData
};
