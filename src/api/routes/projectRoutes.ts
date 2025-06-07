import express from 'express';
import { getProjectDetails } from '../controllers/projectController';

const router = express.Router();

// retrieves project details
router.get('/', getProjectDetails);

export default router;
