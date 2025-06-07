import { NextFunction, Request, Response } from 'express';

import { getUserData } from '../services/authentication/authentication';

/**
 * Checks if an existing user session exists and if does, attach user data.
 *
 * @param req request from call
 * @param res response to call
 * @param next next to proceed
 *
 * @returns 403 if session not found, else proceed
 */
const checkUserSession = async (req: Request, res: Response, next: NextFunction) => {
  const userData = await getUserData(req.sessionID, req.session.userId || null, req.session.provider as string);

  if (!userData) {
    return res.status(401).json({ error: 'User session not found' });
  }

  req.userData = userData;
  next();
};

export default checkUserSession;
