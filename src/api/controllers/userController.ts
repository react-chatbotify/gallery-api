import { Request, Response } from "express";
import FavoriteTheme from "../databases/sql/models/FavoriteTheme";
import Theme from "../databases/sql/models/Theme";
import { sequelize } from "../databases/sql/sql";
import { checkIsAdminUser } from "../services/authorization";

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
  const queryUserId = req.query.userId as string;
  const sessionUserId = req.session.userId;

  // if user id matches or user is admin, can retrieve user data
  if (
    !queryUserId ||
    queryUserId === sessionUserId ||
    checkIsAdminUser(userData)
  ) {
    return res.json(userData);
  }

  // all other cases unauthorized
  return res.status(403).json({ error: "Unauthorized access" });
};

/**
 * Retrieves themes belonging to the user.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of user's themes if successful, 403 otherwise
 */
const getUserThemes = async (req: Request, res: Response) => {
  const userData = req.userData;
  const queryUserId = req.query.userId as string;
  const sessionUserId = req.session.userId;

  // if user id matches or user is admin, can retrieve user themes
  if (
    !queryUserId ||
    queryUserId === sessionUserId ||
    checkIsAdminUser(userData)
  ) {
    try {
      const themes = await Theme.findAll({
        where: {
          user_id: userData.id,
        },
      });
      return res.json(themes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch themes" });
      console.log(error);
    }
  }

  // all other cases unauthorized
  return res.status(403).json({ error: "Unauthorized access" });
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
  const queryUserId = req.query.userId as string;
  const sessionUserId = req.session.userId;

  // if user id matches or user is admin, can retrieve user favorited themes
  if (
    !queryUserId ||
    queryUserId === sessionUserId ||
    checkIsAdminUser(userData)
  ) {
    try {
      const userFavoriteThemes = await FavoriteTheme.findAll({
        where: {
          user_id: userData.id,
        },
        include: [Theme],
      });
      res.json(userFavoriteThemes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user favorite themes" });
      console.log(error);
    }
  }

  // all other cases unauthorized
  return res.status(403).json({ error: "Unauthorized access" });
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
  const { theme_id } = req.body;

  try {
    await sequelize.transaction(async (transaction) => {
      // check if the theme exists
      const theme = await Theme.findByPk(theme_id, { transaction });
      if (!theme) {
        return res.status(404).json({ error: "Theme not found." });
      }

      // check if theme already favorited
      const existingFavorite = await FavoriteTheme.findOne({
        where: {
          user_id: userData.id,
          id: theme_id,
        },
        transaction,
      });

      if (existingFavorite) {
        return res.status(400).json({ error: "Theme already favorited." });
      }

      // add favorite theme
      await FavoriteTheme.create(
        {
          user_id: userData.id,
          id: theme_id,
        },
        { transaction },
      );

      // increment the favorites count in the theme table
      await theme.increment("favorites_count", { by: 1, transaction });
    });

    res.status(201);
  } catch (error) {
    console.error("Error adding favorite theme:", error);
    res.status(500).json({ error: "Failed to add favorite theme." });
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
  const { theme_id } = req.params;

  try {
    await sequelize.transaction(async (transaction) => {
      // check if theme is favorited
      const existingFavorite = await FavoriteTheme.findOne({
        where: {
          user_id: userData.id,
          id: theme_id,
        },
        transaction,
      });

      if (!existingFavorite) {
        return res.status(404).json({ error: "Favorite theme not found" });
      }

      // remove favorite theme
      await existingFavorite.destroy({ transaction });

      // decrement the favorites count in the theme table
      const theme = await Theme.findByPk(theme_id, { transaction });
      if (theme) {
        await theme.decrement("favorites_count", { by: 1, transaction });
      }
    });

    res.status(200);
  } catch (error) {
    console.error("Error removing favorite theme:", error);
    res.status(500).json({ error: "Failed to remove favorite theme" });
  }
};

export {
  addUserFavoriteTheme,
  getUserFavoriteThemes,
  getUserProfile,
  getUserThemes,
  removeUserFavoriteTheme,
};
