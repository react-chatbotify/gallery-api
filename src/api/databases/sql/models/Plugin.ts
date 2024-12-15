import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../sql';

class Plugin extends Model {}

Plugin.init(
	{
		// unique identifier for the plugins
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		// name of the plugin, a more human-readable friendly identifier but may not be unique
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// a brief description of the plugin
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		// number of favorites given to the plugin
		favoritesCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			field: 'favorites_count',
		},
		// image url of the plugin
		imageUrl: {
			type: DataTypes.STRING,
			allowNull: true,
			field: 'image_url',
		},
		// package url of the plugin
		packageUrl: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'package_url',
		},
		// date when the plugin is created
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			field: 'created_at',
		},
		// date when the plugin was last updated
		updatedAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			field: 'updated_at',
		},
	},
	{
		sequelize,
		modelName: 'Plugin',
		timestamps: false,
	},
);

export default Plugin;
