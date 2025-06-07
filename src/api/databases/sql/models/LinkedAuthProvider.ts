import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../sql';
import User from './User';

/**
 * Stores the login providers associated with a user.
 */
class LinkedAuthProvider extends Model {}

LinkedAuthProvider.init(
  {
    // user id from the login provider (e.g. github user id)
    providerUserId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'provider_user_id',
    },
    // user id for the user created in this application
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      field: 'user_id',
    },
    // name of the login provider
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // date when the link was done
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()'),
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'LinkedAuthProvider',
    timestamps: false,
  }
);

export default LinkedAuthProvider;
