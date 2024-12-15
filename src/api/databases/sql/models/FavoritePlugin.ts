import { DataTypes, Model } from "sequelize";

import { sequelize } from "../sql";

/**
 * Association table between a user and a plugin (user favorite plugin).
 */
class FavoritePlugin extends Model { }

FavoritePlugin.init({
	userId: {
		type: DataTypes.UUID,
		allowNull: false,
		primaryKey: true,
		field: "user_id",
		references: {
			model: "Users",
			key: "id"
		},
		onDelete: "CASCADE"
	},
	pluginId: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
		field: "plugin_id",
		references: {
			model: "Plugins",
			key: "id"
		},
		onDelete: "CASCADE"
	}
}, { 
	sequelize, 
	modelName: "FavoritePlugin",
	timestamps: false 
});

export default FavoritePlugin;
