import express from "express";
import crypto from 'crypto';

import {
	handleCallback,
	handleLoginProcess,
	handleLogout,
} from "../controllers/authController";

const router = express.Router();

// provides callback for github oauth
router.get("/callback", handleCallback);

// handles login process
router.get("/login/process", handleLoginProcess);

// handles logout
router.get("/logout", handleLogout);

// provides csrf token to frontend
router.get('/csrf-token', (req, res) => {
	res.json({ csrfToken: req.csrfToken() });
});

// initiates github oauth login flow
router.get('/github/login', (req, res) => {
	// Generate a random state string
	const state = crypto.randomBytes(16).toString('hex');
	// Store the state in the session
	req.session.oauth_state = state;
	// Construct the GitHub authorization URL
	const GITHUB_CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID;
	// This should be the full URL to your `handleCallback` endpoint
	const REDIRECT_URI = `${process.env.API_BASE_URL}/api/${process.env.API_VERSION}/auth/callback`;

	const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email,repo&state=${state}`;

	res.json({ authorizationUrl: githubAuthUrl });
});

export default router;
