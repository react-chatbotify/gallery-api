import { Request, Response } from 'express';

import { checkIsAdminUser } from '../services/authorization';
import {
  getUserFavoritePluginsFromCache,
  getUserFavoriteThemesFromCache,
  getUserOwnedPluginsFromCache,
  getUserOwnedThemesFromCache,
  saveUserFavoritePluginsToCache,
  saveUserFavoriteThemesToCache,
  saveUserOwnedPluginsToCache,
  saveUserOwnedThemesToCache,
} from '../services/users/cacheService';
import {
  addUserFavoritePluginToDb,
  addUserFavoriteThemeToDb,
  getUserFavoritePluginsFromDb,
  getUserFavoriteThemesFromDb,
  getUserOwnedPluginsFromDb,
  getUserOwnedThemesFromDb,
  removeUserFavoritePluginFromDb,
  removeUserFavoriteThemeFromDb,
} from '../services/users/dbService';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseUtils';
import { User } from '../databases/sql/models';
import Logger from '../logger';

/**
 * Retrieves the user profile information (i.e. user data).
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns user data if successful, 403 otherwise
 */
const getUserProfile = async (req: Request, res: Response) => {
  const userData = req.userData;
  const queryUserId = (req.query.userId as string) ?? userData.id;
  const sessionUserId = req.session.userId;

  // if requesting for own data, allow
  if (queryUserId === sessionUserId) {
    return sendSuccessResponse(res, 200, userData, 'User data fetched successfully.');
  }

  // if not requesting for own data and requestor is not admin, deny
  if (!checkIsAdminUser(userData)) {
    return sendErrorResponse(res, 403, 'Unauthorized access.');
  }

  // todo: add support for admins to get user profile in future
};

/**
 * Retrieves themes belonging to the user.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of user's themes if successful, 403 otherwise
 */
const getUserOwnedThemes = async (req: Request, res: Response) => {
  const userData = req.userData;
  const queryUserId = (req.query.userId as string) ?? userData.id;
  const sessionUserId = req.session.userId;

  // todo: add pagination in future

  // if queried user id does not match or requesting user and requesting user is not admin, deny
  if (queryUserId !== sessionUserId && !checkIsAdminUser(userData)) {
    return sendErrorResponse(res, 403, 'Unauthorized access.');
  }

  try {
    // check if cache contains user ownership and return if so ; otherwise fetch from db
    let userOwnedThemes = await getUserOwnedThemesFromCache(queryUserId);

    if (userOwnedThemes === null) {
      userOwnedThemes = await getUserOwnedThemesFromDb(queryUserId);
      saveUserOwnedThemesToCache(userData.id, userOwnedThemes);
    }

    return sendSuccessResponse(res, 200, userOwnedThemes, 'User owned themes fetched successfully.');
  } catch (error) {
    Logger.error('Error fetching owned themes:', error);
    return sendErrorResponse(res, 500, 'Failed to fetch user owned themes.');
  }
};

/**
 * Retrieves themes that user favorited.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of user's favorited themes if successful, 403 otherwise
 */
const getUserFavoriteThemes = async (req: Request, res: Response) => {
  const userData = req.userData;
  const queryUserId = (req.query.userId as string) ?? userData.id;
  const sessionUserId = req.session.userId;

  // todo: add pagination in future

  // if queried user id does not match or requesting user and requesting user is not admin, deny
  if (queryUserId !== sessionUserId && !checkIsAdminUser(userData)) {
    return sendErrorResponse(res, 403, 'Unauthorized access.');
  }

  try {
    // check if cache contains user favorites and return if so ; otherwise fetch from db
    let userFavorites = await getUserFavoriteThemesFromCache(queryUserId);
    if (userFavorites === null) {
      userFavorites = await getUserFavoriteThemesFromDb(queryUserId);
      saveUserFavoriteThemesToCache(queryUserId, userFavorites);
    }

    return sendSuccessResponse(res, 200, userFavorites, 'User favorite themes fetched successfully.');
  } catch (error) {
    Logger.error('Error fetching favorite themes:', error);
    return sendErrorResponse(res, 500, 'Failed to fetch user favorite themes.');
  }
};

/**
 * Adds a theme to user favorite.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 201 if successful, 404 if theme not found, 400 if already favorited, 500 otherwise
 */
const addUserFavoriteTheme = async (req: Request, res: Response) => {
  const userData = req.userData;
  const { themeId } = req.body;

  try {
    await addUserFavoriteThemeToDb(userData.id, themeId);
    sendSuccessResponse(res, 201, {}, 'Added theme to favorites successfully.');
  } catch (error) {
    Logger.error('Error adding favorite theme:', error);
    sendErrorResponse(res, 500, 'Failed to add favorite theme.');
  }
};

/**
 * Removes a theme from user favorite.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 200 if successful, 404 if theme not found, 500 otherwise
 */
const removeUserFavoriteTheme = async (req: Request, res: Response) => {
  const userData = req.userData;
  const themeId = req.query.themeId as string;

  try {
    await removeUserFavoriteThemeFromDb(userData.id, themeId);
    sendSuccessResponse(res, 200, {}, 'Removed theme from favorites successfully.');
  } catch (error) {
    Logger.error('Error removing favorite theme:', error);
    sendErrorResponse(res, 500, 'Failed to remove favorite theme.');
  }
};

/**
 * Retrieves plugins belonging to the user.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of user's plugins if successful, 403 otherwise
 */
const getUserOwnedPlugins = async (req: Request, res: Response) => {
  const userData = req.userData;
  const queryUserId = (req.query.userId as string) ?? userData.id;
  const sessionUserId = req.session.userId;

  // todo: add pagination in future

  // if queried user id does not match or requesting user and requesting user is not admin, deny
  if (queryUserId !== sessionUserId && !checkIsAdminUser(userData)) {
    return sendErrorResponse(res, 403, 'Unauthorized access.');
  }

  try {
    // check if cache contains user ownership and return if so ; otherwise fetch from db
    let userOwnedPlugins = await getUserOwnedPluginsFromCache(queryUserId);
    if (userOwnedPlugins === null) {
      userOwnedPlugins = await getUserOwnedPluginsFromDb(queryUserId);
      saveUserOwnedPluginsToCache(userData.id, userOwnedPlugins);
    }

    return sendSuccessResponse(res, 200, userOwnedPlugins, 'User owned plugins fetched successfully.');
  } catch (error) {
    Logger.error('Error fetching owned plugins:', error);
    return sendErrorResponse(res, 500, 'Failed to fetch user owned plugins.');
  }
};

/**
 * Retrieves plugins that user favorited.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of user's favorited plugins if successful, 403 otherwise
 */
const getUserFavoritePlugins = async (req: Request, res: Response) => {
  const userData = req.userData;
  const queryUserId = (req.query.userId as string) ?? userData.id;
  const sessionUserId = req.session.userId;

  // todo: add pagination in future

  // if queried user id does not match or requesting user and requesting user is not admin, deny
  if (queryUserId !== sessionUserId && !checkIsAdminUser(userData)) {
    return sendErrorResponse(res, 403, 'Unauthorized access.');
  }

  try {
    // check if cache contains user favorites and return if so ; otherwise fetch from db
    let userFavorites = await getUserFavoritePluginsFromCache(queryUserId);
    if (userFavorites === null) {
      userFavorites = await getUserFavoritePluginsFromDb(queryUserId);
      saveUserFavoritePluginsToCache(queryUserId, userFavorites);
    }

    return sendSuccessResponse(res, 200, userFavorites, 'User favorite plugins fetched successfully.');
  } catch (error) {
    Logger.error('Error fetching favorite plugins:', error);
    return sendErrorResponse(res, 500, 'Failed to fetch user favorite plugins.');
  }
};

/**
 * Adds a plugin to user favorite.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 201 if successful, 404 if theme not found, 400 if already favorited, 500 otherwise
 */
const addUserFavoritePlugin = async (req: Request, res: Response) => {
  const userData = req.userData;
  const { pluginId } = req.body;

  try {
    await addUserFavoritePluginToDb(userData.id, pluginId);
    sendSuccessResponse(res, 201, {}, 'Added plugin to favorites successfully.');
  } catch (error) {
    Logger.error('Error adding favorite plugin:', error);
    sendErrorResponse(res, 500, 'Failed to add favorite plugin.');
  }
};

/**
 * Removes a plugin from user favorite.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 200 if successful, 404 if theme not found, 500 otherwise
 */
const removeUserFavoritePlugin = async (req: Request, res: Response) => {
  const userData = req.userData;
  const pluginId = req.query.pluginId as string;

  try {
    await removeUserFavoritePluginFromDb(userData.id, pluginId);
    sendSuccessResponse(res, 200, {}, 'Removed plugin from favorites successfully.');
  } catch (error) {
    Logger.error('Error removing favorite plugin:', error);
    sendErrorResponse(res, 500, 'Failed to remove favorite plugin.');
  }
};

/**
 * Sets if a user accepts author agreement.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 200 if successful, 400 if invalid request body and, 500 otherwise
 */
const setUserAcceptAuthorAgreement = async (req: Request, res: Response) => {
  const userData = req.userData;
  const userId = userData.id;
  const accept = req.body.accept;

  if (typeof accept === 'boolean') {
    try {
      await User.update({ acceptedAuthorAgreement: accept ? new Date() : null }, { where: { id: userId } });

      sendSuccessResponse(
        res,
        200,
        {},
        accept ? 'Author agreement accepted successfully.' : 'Author agreement status reset successfully.'
      );
    } catch (error) {
      Logger.error('Error updating user author agreement:', error);
      sendErrorResponse(res, 500, 'Failed to update author agreement status.');
    }
  } else {
    sendErrorResponse(res, 400, 'Invalid request. Accept must be a boolean.');
  }
};

export {
  addUserFavoritePlugin,
  addUserFavoriteTheme,
  getUserFavoritePlugins,
  getUserFavoriteThemes,
  getUserProfile,
  getUserOwnedThemes,
  getUserOwnedPlugins,
  removeUserFavoritePlugin,
  removeUserFavoriteTheme,
  setUserAcceptAuthorAgreement,
};
