import { Op } from 'sequelize';
import { Plugin } from '../databases/sql/models';

interface GetPlugins {
  searchQuery: string;
  offset: number;
  limit: number;
}
export async function getPluginsService({
  searchQuery,
  limit,
  offset,
}: GetPlugins) {
  const whereClause = searchQuery
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
        ],
      }
    : {};

  try {
    const plugins = await Plugin.findAll({
      where: whereClause,
      offset,
      limit,
      raw: true,
    });
    return plugins;
  } catch (e) {
    throw e;
  }
}
