import express, { type RequestHandler } from 'express';

// IMPORTANT: this import is replaced below with your actual path
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import userRoutes from '../../src/api/routes/userRoutes.ts';

export const BASE = `/api/${process.env.API_VERSION || 'v1'}/users`;

const notFound: RequestHandler = (_req, res): void => {
  res.status(404).json({ error: 'not_found' });
};

export const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(BASE, userRoutes);
  // No string path here; avoids path-to-regexp '*' issues in Express 5
  app.use(notFound);
  return app;
};

export const http = () => {
  const app = makeApp();
  // lazy require to keep types optional
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const request = require('supertest') as typeof import('supertest');
  return request(app);
};
