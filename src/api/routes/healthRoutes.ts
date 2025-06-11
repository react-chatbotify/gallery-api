import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController';

const router = Router();

router.get('/healthz', getHealthStatus);

export default router;
