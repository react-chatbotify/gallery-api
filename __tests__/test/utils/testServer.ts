import express, { type RequestHandler } from 'express';
import userRoutes from '../../../src/api/routes/userRoutes';

export const BASE = `/api/${process.env.API_VERSION || 'v1'}/users`;

const notFound: RequestHandler = (_req, res): void => {
  res.status(404).json({ error: 'not_found' });
};

export const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(BASE, userRoutes);
  app.use(notFound);
  return app;
};

export const http = () => {
  const app = makeApp();
  const request = require('supertest') as typeof import('supertest');
  return request(app);
};
