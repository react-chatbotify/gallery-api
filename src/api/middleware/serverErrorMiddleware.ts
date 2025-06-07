import { Request, Response } from 'express';
import Logger from '../logger';

const errorHandler = (err: Error, req: Request, res: Response) => {
  Logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

export default errorHandler;
