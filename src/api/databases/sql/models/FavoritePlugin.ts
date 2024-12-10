import { Model } from 'sequelize';
import { sequelize } from '../sql';
import User from './User';
import Plugin from './Plugin';

/**
 * Association table between a user and a plugin (user favorite plugin).
 */
class FavoritePlugin extends Model {}

FavoritePlugin.init({}, { sequelize, modelName: 'FavoritePlugin' });

// contains only user id and plugin id to associate user favorites
FavoritePlugin.belongsTo(User, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});

FavoritePlugin.belongsTo(Plugin, {
    foreignKey: "pluginId",
    onDelete: "CASCADE",
});

export default FavoritePlugin;
