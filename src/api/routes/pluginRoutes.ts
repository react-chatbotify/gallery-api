import express from 'express';
import multer from 'multer';

import {
  getPlugins,
  getPluginsNoAuth,
  getPluginById,
  getPluginVersions,
  publishPlugin,
  unpublishPlugin,
} from '../controllers/pluginController';
import checkUserSession from '../middleware/userSessionMiddleware';
import { getUserData } from '../services/authentication/authentication';
import { getFileExtension } from '../utils/fileUtils';

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
    const allowedExtensions = ['png'];
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

// retrieves plugins (handles both auth and no auth)
router.get('/', async (req, res) => {
  const userData = await getUserData(req.sessionID, req.session.userId || null, req.session.provider as string);
  if (userData) {
    req.userData = userData;
    getPlugins(req, res);
  } else {
    getPluginsNoAuth(req, res);
  }
});

// retrieves data for a specific plugin
router.get('/:plugin_id', async (req, res) => {
  const userData = await getUserData(req.sessionID, req.session.userId || null, req.session.provider as string);
  if (userData) {
    req.userData = userData;
  }
  getPluginById(req, res);
});

// retrieves plugin versions
router.get('/versions', getPluginVersions);

// publish plugin
router.post('/publish', checkUserSession, upload.fields([{ name: 'imgUrl', maxCount: 1 }]), publishPlugin);

// unpublish plugin
router.delete('/unpublish', checkUserSession, unpublishPlugin);

export default router;
