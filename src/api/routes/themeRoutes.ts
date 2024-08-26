import express from "express";
import multer from "multer";
import {
  getThemes,
  getThemeVersions,
  publishTheme,
  unpublishTheme,
} from "../controllers/themeController";
import checkUserSession from "../middleware/userSessionMiddleware";

// multer storage configuration
const storage = multer.memoryStorage();

// file upload middleware with file type filter and limits
const upload = multer({
  storage: storage,
  // todo: review this limit
  limits: {
    fileSize: 5 * 1024 * 1024, // default to 5mb
  },
  fileFilter: (req, file, cb) => {
    // allow only these file extensions
    const allowedExtensions = [".css", ".json", ".png"];
    const fileExtension = getFileExtension(file.originalname);
    // todo: can enforce file name together with extension as well
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file extension"));
    }
  },
});

// helper function to get file extension
function getFileExtension(filename: string) {
  return filename
    .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
    .toLowerCase();
}

const router = express.Router();

// retrieves themes
router.get("/", getThemes);

// retrieves theme versions
router.get("/versions", getThemeVersions);

// publish theme
router.post(
  "/publish",
  checkUserSession,
  upload.fields([
    { name: "styles", maxCount: 1 },
    { name: "options", maxCount: 1 },
    { name: "display", maxCount: 1 },
  ]),
  publishTheme,
);

// unpublish theme
router.delete("/unpublish", checkUserSession, unpublishTheme);

export default router;
