import { Request, Response } from 'express';

// todo: maybe build a separate lightweight status service as well
// should also consider rag service
export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
};
