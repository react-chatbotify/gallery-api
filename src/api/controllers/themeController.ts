import { Request, Response } from "express";
import { Op } from "sequelize";
import Theme from "../databases/sql/models/Theme";
import ThemeJobQueue from "../databases/sql/models/ThemeJobQueue";
import ThemeVersion from "../databases/sql/models/ThemeVersion";
import { checkIsAdminUser } from "../services/authorization";

/**
 * Handles fetching of themes.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of themes on success, 500 error otherwise
 */
const getThemes = async (req: Request, res: Response) => {
  // default to returning 30 themes per page
  // default to returning only first page if not specified
  // default to no searches
  const { pageSize = 30, pageNum = 1, searchQuery = "" } = req.query;

  // construct clause for searching themes
  const limit = parseInt(pageSize as string, 30);
  const offset = (parseInt(pageNum as string, 30) - 1) * limit;
  const whereClause = searchQuery
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
        ],
      }
    : {};

  // fetch themes according to page size, page num and search query
  try {
    const themes = await Theme.findAll({
      where: whereClause,
      limit,
      offset,
    });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch themes" });
  }
};

/**
 * Retrieves all the published versions for a theme.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns list of theme versions on success, 500 error otherwise
 */
const getThemeVersions = async (req: Request, res: Response) => {
  try {
    const versions = await ThemeVersion.findAll({
      where: { theme_id: req.query.themeId },
    });

    res.json(versions);
  } catch (error) {
    console.error("Error fetching theme versions:", error);
    res.status(500).json({ error: "Failed to fetch theme versions" });
  }
};

/**
 * Publishes a new theme (including version bumps).
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 201 on success, 500 otherwise
 */
const publishTheme = async (req: Request, res: Response) => {
  const userData = req.userData;
  const { theme_id, name, description, version } = req.body;

  // todo: perform checks in the following steps:
  // 1) if theme_id already exist and user is not author, 403
  // 2) if theme_id already exist and user is author but version already exist, 400
  // 3) if theme_id does not exist or user is author of theme but has no existing version, continue below
  // 4) rigorously validate file inputs (styles.json, styles.css, settings.json)
  // 5) if fail checks, immediately return and don't do any further queuing or processing
  // 6) provide verbose reasons for frontend to render to user
  const validationPassed = true;
  if (!validationPassed) {
    return res
      .status(400)
      .json({ error: "Failed to publish theme, validation failed." });
  }

  // add the new creation to theme job queue for processing later
  try {
    await ThemeJobQueue.create({
      user_id: userData.id,
      theme_id,
      name,
      description,
      action: "CREATE",
    });

    // todo: push files into minio bucket with theme_id for process queue job to pick up

    res.status(201);
  } catch (error) {
    console.error("Error publishing theme:", error);
    res
      .status(500)
      .json({ error: "Failed to publish theme, please try again." });
  }
};

/**
 * Unpublishes an existing theme.
 *
 * @param req request from call
 * @param res response to call
 *
 * @returns 200 on success, 500 otherwise
 */
const unpublishTheme = async (req: Request, res: Response) => {
  const userData = req.userData;
  const { theme_id } = req.params;

  // check if the theme exists and is owned by the user
  try {
    const theme = await Theme.findOne({
      where: {
        id: theme_id,
      },
    });

    // if theme does not exist, cannot delete
    if (!theme) {
      return res
        .status(404)
        .json({
          error: "Failed to unpublish theme, the theme does not exist.",
        });
    }

    // if theme exist and user is admin, can delete
    const isAdminUser = checkIsAdminUser(userData);
    if (isAdminUser) {
      // todo: allow admins to forcibly unpublish themes
    }

    // todo: review how to handle unpublishing of themes, authors should not be allowed to delete themes anytime
    // as there may be existing projects using their themes - perhaps separately have a support system for such action
    return res.status(400).json({ error: "Feature not allowed." });

    // if theme exist but user is not the theme author, cannot delete
    // if (theme.dataValues.user_id != req.session.userId) {
    // 	return res.status(403).json({ error: "Failed to unpublish theme, you are not the theme author." });
    // }

    // delete the theme
    // await theme.destroy();

    // res.status(200);
  } catch (error) {
    console.error("Error unpublishing theme:", error);
    res
      .status(500)
      .json({ error: "Failed to unpublish theme, please try again." });
  }
};

export { getThemes, getThemeVersions, publishTheme, unpublishTheme };
