import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sql";
import Theme from "./Theme";

/**
 * Represents a version of a theme in the application.
 * Tracks the theme id, version number, and release date.
 */
class ThemeVersion extends Model {}

ThemeVersion.init(
  {
    // id to uniquely identify published theme version
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // the identifier of the theme this version belongs to
    theme_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Theme,
        key: "id",
      },
    },
    // the version number of the theme
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // date when this version of the theme was released
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("NOW()"),
    },
  },
  {
    sequelize,
    modelName: "ThemeVersion",
    timestamps: false,
  },
);

ThemeVersion.belongsTo(Theme, { foreignKey: "theme_id" });

export default ThemeVersion;
