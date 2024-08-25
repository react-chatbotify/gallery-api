import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sql";

/**
 * Stores the data of users.
 */
class User extends Model {}

User.init(
  {
    // id to uniquely identify the user
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // email, also uniquely identifies the user
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // the role of the user
    role: {
      type: DataTypes.ENUM("USER", "MODERATOR", "ADMIN"),
      defaultValue: "USER",
      allowNull: false,
    },
    // date when the user accepted the author agreement (necessary to publish themes/plugins)
    accepted_author_agreement: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null, // default to null which is not agreed yet
    },
    // date when user was created
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("NOW()"),
    },
    // date when user was last updated
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("NOW()"),
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: false,
  },
);

export default User;
