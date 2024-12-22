import express from "express";

import {
	addUserFavoritePlugin,
	addUserFavoriteTheme,
	getUserFavoritePlugins,
	getUserFavoriteThemes,
	getUserProfile,
	getUserThemes,
	removeUserFavoritePlugin,
	removeUserFavoriteTheme,
	setUserAcceptAuthorAgreement,
} from "../controllers/userController";
import checkUserSession from "../middleware/userSessionMiddleware";

const router = express.Router();

// retrieves user data
router.get("/profile", checkUserSession, getUserProfile);

// retrieves user themes
router.get("/themes", checkUserSession, getUserThemes);

// retrieves user favorited themes
router.get("/themes/favorited", checkUserSession, getUserFavoriteThemes);

// favorites a theme for user
router.post("/themes/favorited", checkUserSession, addUserFavoriteTheme);

// unfavorites a theme for user
router.delete("/themes/favorited", checkUserSession, removeUserFavoriteTheme)

// retrieves user favorited plugins
router.get("/plugins/favorited", checkUserSession, getUserFavoritePlugins);

// favorites a plugin for user
router.post("/plugins/favorited", checkUserSession, addUserFavoritePlugin);

// unfavorites a plugin for user
router.delete("/plugins/favorited", checkUserSession, removeUserFavoritePlugin)

// agree/disagree to user author agreement
router.post("/author-agreement", checkUserSession, setUserAcceptAuthorAgreement);

// todo: add an endpoint for users to attempt to claim theme ownership
// required if a theme is on github but the author has never logged
// in to the gallery via github oauth - edge case, not typical to happen
// since this means themes were directly added to github without going
// through the website

export default router;