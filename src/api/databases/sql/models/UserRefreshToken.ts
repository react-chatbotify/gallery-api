import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../sql';
import User from './User';

/**
 * Stores the refresh token for users.
 */
class UserRefreshToken extends Model {}

UserRefreshToken.init(
  {
    // user id to identify who the refresh token belongs to
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
      primaryKey: true,
      field: 'user_id',
    },
    // actual refresh token
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'refresh_token',
    },
    // date when refresh token expires
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expiry_date',
    },
  },
  {
    sequelize,
    modelName: 'UserRefreshToken',
    timestamps: false,
  }
);

export default UserRefreshToken;
