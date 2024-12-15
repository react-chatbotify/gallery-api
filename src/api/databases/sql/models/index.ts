import LinkedAuthProvider from "./LinkedAuthProvider";
import User from "./User";
import UserRefreshToken from "./UserRefreshToken";
import Theme from "./Theme";
import ThemeVersion from "./ThemeVersion";
import ThemeJobQueue from "./ThemeJobQueue";
import Plugin from "./Plugin";
import FavoriteTheme from "./FavoriteTheme";
import FavoritePlugin from "./FavoritePlugin";

// theme belongs to a user, but permitted to be empty (for direct theme contributions to github repository)
// todo: perhaps the sync job can attempt to reconcile theme ownership each time it is run based on meta.json author?
Theme.belongsTo(User, { foreignKey: "userId" });

ThemeVersion.belongsTo(Theme, { foreignKey: "themeId" });

// contains only user id and theme id to associate user theme favorites
FavoriteTheme.belongsTo(User, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});
FavoriteTheme.belongsTo(Theme, {
	foreignKey: "themeId",
	onDelete: "CASCADE",
});
User.belongsToMany(Theme, { through: FavoriteTheme, foreignKey: "userId" });
Theme.belongsToMany(User, { through: FavoriteTheme, foreignKey: "themeId" });

Plugin.belongsTo(User, { foreignKey: "userId" });

// contains only user id and theme id to associate user plugin favorites
FavoritePlugin.belongsTo(User, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});
FavoritePlugin.belongsTo(Plugin, {
	foreignKey: "pluginId",
	onDelete: "CASCADE",
});
User.belongsToMany(Plugin, { through: FavoritePlugin, foreignKey: "userId" });
Plugin.belongsToMany(User, { through: FavoritePlugin, foreignKey: "pluginId" });

export {
	LinkedAuthProvider,
	User,
	UserRefreshToken,
	Theme,
	ThemeVersion,
	ThemeJobQueue,
	Plugin,
	FavoriteTheme,
	FavoritePlugin,
};