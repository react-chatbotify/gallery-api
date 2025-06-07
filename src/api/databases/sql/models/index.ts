import LinkedAuthProvider from './LinkedAuthProvider';
import User from './User';
import UserRefreshToken from './UserRefreshToken';
import Theme from './Theme';
import ThemeVersion from './ThemeVersion';
import ThemeJobQueue from './ThemeJobQueue';
import Plugin from './Plugin';
import FavoriteTheme from './FavoriteTheme';
import FavoritePlugin from './FavoritePlugin';

// theme belongs to a user, but permitted to be empty (for direct theme contributions to github repository)
// todo: perhaps the sync job can attempt to reconcile theme ownership each time it is run based on meta.json author?
Theme.belongsTo(User, { foreignKey: 'user_id' });

ThemeVersion.belongsTo(Theme, { foreignKey: 'theme_id' });

// contains only user id and theme id to associate user theme favorites
FavoriteTheme.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});
FavoriteTheme.belongsTo(Theme, {
  foreignKey: 'theme_id',
  onDelete: 'CASCADE',
});
User.belongsToMany(Theme, { through: FavoriteTheme, foreignKey: 'user_id' });
Theme.belongsToMany(User, { through: FavoriteTheme, foreignKey: 'theme_id' });

Plugin.belongsTo(User, { foreignKey: 'user_id' });

// contains only user id and theme id to associate user plugin favorites
FavoritePlugin.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});
FavoritePlugin.belongsTo(Plugin, {
  foreignKey: 'plugin_id',
  onDelete: 'CASCADE',
});
User.belongsToMany(Plugin, { through: FavoritePlugin, foreignKey: 'user_id' });
Plugin.belongsToMany(User, {
  through: FavoritePlugin,
  foreignKey: 'plugin_id',
});

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
