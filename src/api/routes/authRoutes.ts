import express from "express";

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

export default router;
