import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController';

const router = Router();

// todo: should improve health logic
router.get('/healthz', getHealthStatus);

export default router;
