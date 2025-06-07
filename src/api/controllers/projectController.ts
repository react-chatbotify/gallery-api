import { Request, Response } from 'express';
import fetch from 'node-fetch';

import {
  getProjectDetailsFromCache,
  saveProjectDetailsToCache,
} from '../services/projects/cacheService';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseUtils';
import Logger from '../logger';

const WHITELISTED_PROJECTS = [
  'react-chatbotify/gallery-api',
  'react-chatbotify/gallery-website',
];

/**
 * Controller to handle project contributors fetching.
 *
 * @param req Express request object.
 * @param res Express response object.
 */
const getProjectDetails = async (req: Request, res: Response) => {
  const projectName = req.query.projectName as string;

  // Validate project name
  if (!WHITELISTED_PROJECTS.includes(projectName)) {
    sendErrorResponse(
      res,
      400,
      'Invalid project name. Project not whitelisted.',
    );
  }

  try {
    // Attempt to retrieve contributors from cache
    let cachedData = await getProjectDetailsFromCache(projectName);

    if (!cachedData) {
      // if not in cache, fetch from GitHub
      const githubApiUrl = `https://api.github.com/repos/${projectName}/contributors`;
      const response = await fetch(githubApiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch contributors: ${response.statusText}`);
      }

      const data = await response.json();
      const contributors = data.map(
        (contributor: {
          avatar_url: string;
          html_url: string;
          login: string;
        }) => {
          return {
            avatar_url: contributor.avatar_url,
            html_url: contributor.html_url,
            login: contributor.login,
          };
        },
      );

      // Save the filtered contributors to cache
      await saveProjectDetailsToCache(projectName, { contributors });

      cachedData = { contributors };
    }

    sendSuccessResponse(
      res,
      200,
      cachedData,
      'Project details fetched successfully.',
    );
  } catch (error) {
    Logger.error('Error fetching project details:', error);
    sendErrorResponse(res, 500, 'Failed to fetch project details.');
  }
};

export { getProjectDetails };
