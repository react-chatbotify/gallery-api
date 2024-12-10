import { Model } from "sequelize";
import { sequelize } from "../sql";
import Theme from "./Theme";
import User from "./User";

/**
 * Association table between a user and a theme (user favorite theme).
 */
class FavoriteTheme extends Model { }

FavoriteTheme.init({}, { sequelize, modelName: "FavoriteTheme" });

// contains only user id and theme id to associate user favorites
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

export default FavoriteTheme;