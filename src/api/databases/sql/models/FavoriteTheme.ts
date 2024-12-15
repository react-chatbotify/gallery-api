import { DataTypes, Model } from "sequelize";

import { sequelize } from "../sql";

/**
 * Association table between a user and a theme (user favorite theme).
 */
class FavoriteTheme extends Model { }

FavoriteTheme.init({
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
	themeId: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
		field: "theme_id",
		references: {
			model: "Themes",
			key: "id"
		},
		onDelete: "CASCADE"
	}
}, { 
	sequelize, 
	modelName: "FavoriteTheme",
	timestamps: false 
});

export default FavoriteTheme;
