import express from "express";

import {
	handleCallback,
	handleLoginProcess,
} from "../controllers/authController";

const router = express.Router();

// provides callback for github oauth
router.get("/callback", handleCallback);

// handles login process
router.get("/login/process", handleLoginProcess);

export default router;
