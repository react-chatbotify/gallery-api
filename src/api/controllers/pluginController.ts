import { Request, Response } from 'express';
import Plugin from '../databases/sql/models/Plugin';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseUtils';
import Logger from '../logger';
import {
	MINIO_URL,
	uploadBuffer,
} from '../services/minioService';
import * as crypto from 'crypto';
import { getPluginsService } from '../services/plugins';

/**
 * Handles fetching of plugins.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of plugins on success, 500 error otherwise
 */
const getPlugins = async (req: Request, res: Response) => {
	const { pageSize = 30, pageNum = 1, searchQuery = '' } = req.query;
	const limit = parseInt(pageSize as string) || 30;
	const offset = ((parseInt(pageNum as string) || 30) - 1) * limit;

	// todo: add caching, similar to themes
	try {
		const plugins = await getPluginsService({
			searchQuery: searchQuery as string,
			limit,
			offset,
		});

		return sendSuccessResponse(
			res,
			200,
			plugins,
			'Plugins fetched successfully!',
		);
	} catch (error) {
		Logger.error('Error fetching plugins:', error);
		return sendErrorResponse(res, 500, 'Failed to fetch plugins.');
	}
};

//TODO: implement delete plugin, remember to invalidate cache
const deletePlugin = async (req: Request, res: Response) => {};

//TODO: implement edit plugin, remember to invalidate cache
const editPlugin = async (req: Request, res: Response) => {
  const userData = req.userData;
  const { name, description, id } = req.body;
  try {
	const plugin = await Plugin.findOne({
	  where: {
		id,
	  },
	});

	sendSuccessResponse(res, 200, plugin || {}, 'Successful');
  } catch (e) {
	sendErrorResponse(res, 500, 'Error', e as string[]);
  }
};

//TODO: implement publishing a plugin, remember to invalidate cache
const publishPlugin = async (req: Request, res: Response) => {
  const userData = req.userData;
  const { name, description, id } = req.body;
  const imgFile = (req.files as { [fieldname: string]: Express.Multer.File[] })[
	'imgUrl'
  ][0];

  const [fileName, extension] = imgFile.originalname.split('.');
  const imgName =
	fileName + crypto.randomBytes(20).toString('hex') + '.' + extension;
  try {
	await uploadBuffer('plugins-images', imgName, imgFile.buffer);
	const imageUrl = `${MINIO_URL}/plugins-images/${imgName}`;

	const plugin = await Plugin.create({
	  name: name,
	  description: description,
	  imageUrl,
	  userId: userData.id,
	  id: id,
	});

	sendSuccessResponse(res, 200, plugin, 'Successful');
  } catch (e) {
	sendErrorResponse(res, 500, 'Error', e as string[]);
  }
};
export { getPlugins, publishPlugin, editPlugin };
