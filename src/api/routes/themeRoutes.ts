import express from 'express';
import multer from 'multer';

import {
	getThemes,
	getThemesNoAuth,
	getThemeVersions,
	publishTheme,
	unpublishTheme,
} from '../controllers/themeController';
import checkUserSession from '../middleware/userSessionMiddleware';
import { getUserData } from '../services/authentication/authentication';
import { getFileExtension } from "../utils/fileUtils";

// multer storage configuration
const storage = multer.memoryStorage();

// file upload middleware with file type filter and limits
const upload = multer({
	// todo: review this limit
	limits: {
		fileSize: 5 * 1024 * 1024, // default to 5mb
	},
	fileFilter: (req, file, cb) => {
		// allow only these file extensions
		const allowedExtensions = ['.css', '.json', '.png'];
		const fileExtension = getFileExtension(file.originalname);
		// todo: can enforce file name together with extension as well
		if (allowedExtensions.includes(fileExtension)) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file extension'));
		}
	},
	storage,
});

const router = express.Router();

// retrieves themes (handles both auth and no auth)
router.get('/', async (req, res) => {
	const userData = await getUserData(req.sessionID, req.session.userId || null, req.session.provider as string);
	if (userData) {
		req.userData = userData;
		getThemes(req, res);
	} else {
		getThemesNoAuth(req, res);
	}
});

// retrieves theme versions
router.get('/versions', getThemeVersions);

// publish theme
router.post(
	'/publish',
	checkUserSession,
	upload.fields([
		{ name: 'styles', maxCount: 1 },
		{ name: 'options', maxCount: 1 },
		{ name: 'display', maxCount: 1 },
	]),
	publishTheme,
);

// unpublish theme
router.delete('/unpublish', checkUserSession, unpublishTheme);

export default router;
