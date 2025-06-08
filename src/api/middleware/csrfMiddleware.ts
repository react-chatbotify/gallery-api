// src/middleware/csrfProtection.ts
import { RequestHandler } from 'express';
import Csrf from 'csrf';

const tokens = new Csrf();

const csrfMiddleware: RequestHandler = (req, res, next) => {
  // On safe (idempotent) methods, ensure we have a secret and expose a fresh token
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.session.csrfToken) {
      req.session.csrfToken = tokens.secretSync();
    }
    // send token to client (either as a cookie or in locals for your /csrf-token endpoint)
    res.cookie('XSRF-TOKEN', tokens.create(req.session.csrfToken), {
      // false so client-side can read it
      httpOnly: false,
      // if developing locally, set to insecure
      secure: process.env.NODE_ENV !== 'local',
      // in production, use "lax" as frontend and backend have the same root domain
      sameSite: process.env.NODE_ENV === 'local' ? 'none' : 'lax',
      // if not in production, leave domain as undefined
      domain: process.env.NODE_ENV === 'local' ? undefined : process.env.COOKIE_DOMAIN,
    });
    return next();
  }

  // On state-changing methods, verify incoming token
  const sent = req.get('X-CSRF-Token') || req.body._csrf;
  if (req.session.csrfToken && typeof sent === 'string' && tokens.verify(req.session.csrfToken, sent)) {
    return next();
  }

  res.status(403).json({ error: 'Invalid CSRF token' });
};

export { csrfMiddleware };
