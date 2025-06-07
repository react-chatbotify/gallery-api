import axios from 'axios';

import { TokenResponse } from '../../../interfaces/TokenResponse';
import { UserProviderData } from '../../../interfaces/UserProviderData';
import { decrypt } from '../../cryptoService';
import Logger from '../../../logger';

/**
 * Retrieves access and refresh token with auth code.
 *
 * @param key encrypted auth code
 *
 * @returns token response object if successful, null otherwise
 */
const getUserTokensWithCode = async (key: string) => {
  const code = decrypt(key);
  try {
    const response = await axios({
      method: 'post',
      url:
        `https://github.com/login/oauth/access_token?` +
        `client_id=${process.env.GITHUB_APP_CLIENT_ID}&` +
        `client_secret=${process.env.GITHUB_APP_CLIENT_SECRET}&` +
        `code=${code}&` +
        `scope=user:email,repo`,
      headers: {
        accept: 'application/json',
      },
    });

    if (response.status >= 300) {
      return null;
    }

    // buffer 15 minutes from token expiry times, hence -900
    // multiply expiry time by 1000 since it is given in seconds
    const tokenResponse: TokenResponse = {
      accessToken: response.data.access_token,
      accessTokenExpiry: Date.now() + response.data.expires_in * 1000 - 900,
      refreshToken: response.data.refresh_token,
      refreshTokenExpiry:
        Date.now() + response.data.refresh_token_expires_in * 1000 - 900,
    };
    return tokenResponse;
  } catch (error) {
    Logger.error('Error getting access token from GitHub:', error);
    return null;
  }
};

/**
 * Retrieves access and refresh token with current refresh token.
 *
 * @param refreshToken: current refresh token
 *
 * @returns token response object if successful, null otherwise
 */
const getUserTokensWithRefresh = async (refreshToken: string) => {
  try {
    const response = await axios({
      method: 'post',
      url:
        `https://github.com/login/oauth/access_token?` +
        `client_id=${process.env.GITHUB_APP_CLIENT_ID}&` +
        `client_secret=${process.env.GITHUB_APP_CLIENT_SECRET}&` +
        'grant_type=refresh_token&' +
        `refresh_token=${refreshToken}`,
      headers: {
        accept: 'application/json',
      },
    });

    if (response.status >= 300) {
      return null;
    }

    // buffer 15 minutes from token expiry times, hence -900
    // multiply expiry time by 1000 since it is given in seconds
    const tokenResponse: TokenResponse = {
      accessToken: response.data.access_token,
      accessTokenExpiry: Date.now() + response.data.expires_in * 1000 - 900,
      refreshToken: response.data.refresh_token,
      refreshTokenExpiry:
        Date.now() + response.data.refresh_token_expires_in * 1000 - 900,
    };
    return tokenResponse;
  } catch (error) {
    Logger.error('Error refreshing GitHub tokens:', error);
    throw error;
  }
};

/**
 * Retrieves user data from github.
 *
 * @param accessToken token to use to get user data
 *
 * @returns user data from github
 */
const getUserData = async (
  accessToken: string,
): Promise<UserProviderData | null> => {
  try {
    const userResponse = await axios({
      method: 'get',
      url: `https://api.github.com/user`,
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    if (userResponse.status >= 300) {
      return null;
    }
    const data = userResponse.data;

    // handles cases where users make email private, need to fetch specially
    if (!data.email) {
      const emailResponse = await axios({
        method: 'get',
        url: `https://api.github.com/user/emails`,
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      });

      if (emailResponse.status >= 300) {
        return null;
      }

      const result = emailResponse.data.find(
        (email: { email: string; verified: boolean; primary: boolean }) =>
          email.primary === true,
      );

      data.email = result.email;
    }

    // insert data into common provider data fields
    const userProviderData: UserProviderData = {
      name: data.name,
      email: data.email,
      handle: data.login,
      avatarUrl: data.avatar_url,
      status: data.bio,
      location: data.location,
      profileUrl: data.html_url,
      providerUserId: data.id,
      provider: process.env.GITHUB_LOGIN_PROVIDER as string,
    };
    return userProviderData;
  } catch (error) {
    Logger.error('Error fetching user data from GitHub:', error);
    return null;
  }
};

export { getUserData, getUserTokensWithCode, getUserTokensWithRefresh };
