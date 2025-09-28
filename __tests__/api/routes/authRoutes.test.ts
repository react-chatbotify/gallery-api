import express from 'express';
import request from 'supertest';

jest.mock('../../../src/api/controllers/authController', () => ({
  handleCallback: jest.fn((req, res) => res.status(200).json({ route: 'callback' })),
  handleLoginProcess: jest.fn((req, res) => res.status(200).json({ route: 'loginProcess' })),
  handleLogout: jest.fn((req, res) => res.status(200).json({ route: 'logout' })),
  handleGitHubLogin: jest.fn((req, res) => res.status(200).json({ route: 'githubLogin' })),
}));

import authRoutes from '../../../src/api/routes/authRoutes';
import {
  handleCallback,
  handleGitHubLogin,
  handleLoginProcess,
  handleLogout,
} from '../../../src/api/controllers/authController';

const mockedHandleCallback = handleCallback as jest.MockedFunction<typeof handleCallback>;
const mockedHandleLoginProcess = handleLoginProcess as jest.MockedFunction<typeof handleLoginProcess>;
const mockedHandleLogout = handleLogout as jest.MockedFunction<typeof handleLogout>;
const mockedHandleGitHubLogin = handleGitHubLogin as jest.MockedFunction<typeof handleGitHubLogin>;

describe('auth routes', () => {
  const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

  const app = express();
  app.use(`${API_PREFIX}/auth`, authRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes GET /callback to handleCallback', async () => {
    const response = await request(app).get(`${API_PREFIX}/auth/callback`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'callback' });
    expect(mockedHandleCallback).toHaveBeenCalledTimes(1);
  });

  it('routes GET /login/process to handleLoginProcess', async () => {
    const response = await request(app).get(`${API_PREFIX}/auth/login/process`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'loginProcess' });
    expect(mockedHandleLoginProcess).toHaveBeenCalledTimes(1);
  });

  it('routes GET /logout to handleLogout', async () => {
    const response = await request(app).get(`${API_PREFIX}/auth/logout`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'logout' });
    expect(mockedHandleLogout).toHaveBeenCalledTimes(1);
  });

  it('routes GET /github/login to handleGitHubLogin', async () => {
    const response = await request(app).get(`${API_PREFIX}/auth/github/login`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'githubLogin' });
    expect(mockedHandleGitHubLogin).toHaveBeenCalledTimes(1);
  });
});