// plugin data stored in the backend
interface PluginData {
  id: string;
  name: string;
  description: string;
  favoritesCount: number;
  packageUrl: string;
  isFavorite?: boolean;
  userId: string;
  authorName?: string;
}

export { PluginData };
