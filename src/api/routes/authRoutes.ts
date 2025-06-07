import express from 'express';
import crypto from 'crypto';

import {
  handleCallback,
  handleGetCsrfToken,
  handleGitHubLogin,
  handleLoginProcess,
  handleLogout,
} from '../controllers/authController';

const router = express.Router();

// provides callback for github oauth
router.get('/callback', handleCallback);

// handles login process
router.get('/login/process', handleLoginProcess);

// handles logout
router.get('/logout', handleLogout);

// provides csrf token to frontend
router.get('/csrf-token', handleGetCsrfToken);

// initiates github oauth login flow
router.get('/github/login', handleGitHubLogin);

export default router;
