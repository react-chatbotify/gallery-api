import express from 'express';
import request from 'supertest';

// Mock controller handlers to simple 200 responses we can assert
jest.mock('../../../src/api/controllers/userController', () => ({
  getUserProfile:            jest.fn((req, res) => res.status(200).json({ route: 'profile' })),
  getUserOwnedThemes:        jest.fn((req, res) => res.status(200).json({ route: 'ownedThemes' })),
  getUserFavoriteThemes:     jest.fn((req, res) => res.status(200).json({ route: 'favoriteThemes' })),
  addUserFavoriteTheme:      jest.fn((req, res) => res.status(200).json({ route: 'addFavoriteTheme' })),
  removeUserFavoriteTheme:   jest.fn((req, res) => res.status(200).json({ route: 'removeFavoriteTheme' })),
  getUserOwnedPlugins:       jest.fn((req, res) => res.status(200).json({ route: 'ownedPlugins' })),
  getUserFavoritePlugins:    jest.fn((req, res) => res.status(200).json({ route: 'favoritePlugins' })),
  addUserFavoritePlugin:     jest.fn((req, res) => res.status(200).json({ route: 'addFavoritePlugin' })),
  removeUserFavoritePlugin:  jest.fn((req, res) => res.status(200).json({ route: 'removeFavoritePlugin' })),
  setUserAcceptAuthorAgreement: jest.fn((req, res) => res.status(200).json({ route: 'authorAgreement' })),
}));

// Mock session middleware to simply call next()
jest.mock('../../../src/api/middleware/userSessionMiddleware', () => ({
  __esModule: true,
  default: (_req: any, _res: any, next: any) => next(),
}));

import userRoutes from '../../../src/api/routes/userRoutes';
import {
  getUserProfile,
  getUserOwnedThemes,
  getUserFavoriteThemes,
  addUserFavoriteTheme,
  removeUserFavoriteTheme,
  getUserOwnedPlugins,
  getUserFavoritePlugins,
  addUserFavoritePlugin,
  removeUserFavoritePlugin,
  setUserAcceptAuthorAgreement,
} from '../../../src/api/controllers/userController';

const mGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mGetUserOwnedThemes = getUserOwnedThemes as jest.MockedFunction<typeof getUserOwnedThemes>;
const mGetUserFavoriteThemes = getUserFavoriteThemes as jest.MockedFunction<typeof getUserFavoriteThemes>;
const mAddUserFavoriteTheme = addUserFavoriteTheme as jest.MockedFunction<typeof addUserFavoriteTheme>;
const mRemoveUserFavoriteTheme = removeUserFavoriteTheme as jest.MockedFunction<typeof removeUserFavoriteTheme>;
const mGetUserOwnedPlugins = getUserOwnedPlugins as jest.MockedFunction<typeof getUserOwnedPlugins>;
const mGetUserFavoritePlugins = getUserFavoritePlugins as jest.MockedFunction<typeof getUserFavoritePlugins>;
const mAddUserFavoritePlugin = addUserFavoritePlugin as jest.MockedFunction<typeof addUserFavoritePlugin>;
const mRemoveUserFavoritePlugin = removeUserFavoritePlugin as jest.MockedFunction<typeof removeUserFavoritePlugin>;
const mSetUserAcceptAuthorAgreement = setUserAcceptAuthorAgreement as jest.MockedFunction<typeof setUserAcceptAuthorAgreement>;

describe('user routes', () => {
  const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;
  const app = express();

  app.use(`${API_PREFIX}/users`, userRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /profile -> getUserProfile', async () => {
    const res = await request(app).get(`${API_PREFIX}/users/profile`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'profile' });
    expect(mGetUserProfile).toHaveBeenCalledTimes(1);
  });

  it('GET /themes -> getUserOwnedThemes', async () => {
    const res = await request(app).get(`${API_PREFIX}/users/themes`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'ownedThemes' });
    expect(mGetUserOwnedThemes).toHaveBeenCalledTimes(1);
  });

  it('GET /themes/favorited -> getUserFavoriteThemes', async () => {
    const res = await request(app).get(`${API_PREFIX}/users/themes/favorited`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'favoriteThemes' });
    expect(mGetUserFavoriteThemes).toHaveBeenCalledTimes(1);
  });

  it('POST /themes/favorited -> addUserFavoriteTheme', async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/users/themes/favorited`)
      .send({ themeId: 't-1' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'addFavoriteTheme' });
    expect(mAddUserFavoriteTheme).toHaveBeenCalledTimes(1);
  });

  it('DELETE /themes/favorited -> removeUserFavoriteTheme', async () => {
    const res = await request(app)
      .delete(`${API_PREFIX}/users/themes/favorited`)
      .send({ themeId: 't-1' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'removeFavoriteTheme' });
    expect(mRemoveUserFavoriteTheme).toHaveBeenCalledTimes(1);
  });

  it('GET /plugins -> getUserOwnedPlugins', async () => {
    const res = await request(app).get(`${API_PREFIX}/users/plugins`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'ownedPlugins' });
    expect(mGetUserOwnedPlugins).toHaveBeenCalledTimes(1);
  });

  it('GET /plugins/favorited -> getUserFavoritePlugins', async () => {
    const res = await request(app).get(`${API_PREFIX}/users/plugins/favorited`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'favoritePlugins' });
    expect(mGetUserFavoritePlugins).toHaveBeenCalledTimes(1);
  });

  it('POST /plugins/favorited -> addUserFavoritePlugin', async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/users/plugins/favorited`)
      .send({ pluginId: 'p-1' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'addFavoritePlugin' });
    expect(mAddUserFavoritePlugin).toHaveBeenCalledTimes(1);
  });

  it('DELETE /plugins/favorited -> removeUserFavoritePlugin', async () => {
    const res = await request(app)
      .delete(`${API_PREFIX}/users/plugins/favorited`)
      .send({ pluginId: 'p-1' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'removeFavoritePlugin' });
    expect(mRemoveUserFavoritePlugin).toHaveBeenCalledTimes(1);
  });

  it('POST /author-agreement -> setUserAcceptAuthorAgreement', async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/users/author-agreement`)
      .send({ accept: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'authorAgreement' });
    expect(mSetUserAcceptAuthorAgreement).toHaveBeenCalledTimes(1);
  });
});
