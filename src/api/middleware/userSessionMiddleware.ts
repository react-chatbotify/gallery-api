import { NextFunction, Request, Response } from 'express';

import Logger from '../logger';
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
const checkUserSession = (req: Request, res: Response, next: NextFunction) => {
  Logger.debug(
    `checkUserSession: sessionID: ${req.sessionID}, sessionUserID: ${req.session?.userId}, sessionProvider: ${req.session?.provider}`
  );
  getUserData(req.sessionID, req.session.userId || null, req.session.provider as string)
    .then((userData) => {
      if (!userData) {
        return res.status(401).json({ error: 'User session not found' });
      }
      req.userData = userData;
      next();
    })
    .catch(next);
};

export default checkUserSession;
