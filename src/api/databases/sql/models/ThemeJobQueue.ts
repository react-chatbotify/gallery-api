import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../sql';

/**
 * Serves as a job queue for the themes that need to be processed.
 */
class ThemeJobQueue extends Model {}

ThemeJobQueue.init(
  {
    // id to uniquely identify the job
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    // name of the theme, used to generate meta.json and copied into the theme table
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // description of the theme, used to generate meta.json and copied into the theme table
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // version of the theme for this job
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // action for this job (create or delete theme)
    action: {
      type: DataTypes.ENUM,
      values: ['CREATE', 'DELETE'],
      allowNull: false,
    },
    // date of job creation
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()'),
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'ThemeJobQueue',
    timestamps: false,
  }
);

export default ThemeJobQueue;
