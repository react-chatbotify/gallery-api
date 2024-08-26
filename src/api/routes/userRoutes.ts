import express from "express";
import {
  addUserFavoriteTheme,
  getUserFavoriteThemes,
  getUserProfile,
  getUserThemes,
  removeUserFavoriteTheme,
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
router.delete("/themes/favorited", checkUserSession, removeUserFavoriteTheme);

// todo: add an endpoint for users to attempt to claim theme ownership
// required if a theme is on github but the author has never logged
// in to the gallery via github oauth - edge case, not typical to happen
// since this means themes were directly added to github without going
// through the website

export default router;
