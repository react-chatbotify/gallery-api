import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sql";
import User from "./User";

/**
 * Stores the refresh token for users.
 */
class UserRefreshToken extends Model {}

UserRefreshToken.init(
  {
    // user id to identify who the refresh token belongs to
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      primaryKey: true,
    },
    // actual refresh token
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // date when refresh token expires
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserRefreshToken",
    timestamps: false,
  },
);

export default UserRefreshToken;
