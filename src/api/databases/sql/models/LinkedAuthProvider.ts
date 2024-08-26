import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sql";
import User from "./User";

/**
 * Stores the login providers associated with a user.
 */
class LinkedAuthProvider extends Model {}

LinkedAuthProvider.init(
  {
    // user id from the login provider (e.g. github user id)
    provider_user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    // user id for the user created in this application
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    // name of the login provider
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // date when the link was done
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("NOW()"),
    },
  },
  {
    sequelize,
    modelName: "LinkedAuthProvider",
    timestamps: false,
  },
);

export default LinkedAuthProvider;
