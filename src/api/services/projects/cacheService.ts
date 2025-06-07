import { redisEphemeralClient } from '../../databases/redis';
import { ProjectDetails } from '../../interfaces/ProjectDetails';

const PROJECT_DETAILS_CACHE_PREFIX = process.env.PROJECT_DETAILS_CACHE_PREFIX;

/**
 * Retrieves project details from cache.
 *
 * @param projectName name of the project to retrieve details for
 *
 * @returns object containing project details, or null if not found
 */
const getProjectDetailsFromCache = async (
  projectName: string,
): Promise<ProjectDetails | null> => {
  const cacheKey = `${PROJECT_DETAILS_CACHE_PREFIX}:${projectName}`;
  const cachedData = await redisEphemeralClient.get(cacheKey);
  return cachedData ? JSON.parse(cachedData) : null;
};

/**
 * Saves project details to the cache.
 *
 * @param projectName name of the project
 *
 * @param projectDetails project details to save
 */
const saveProjectDetailsToCache = async (
  projectName: string,
  projectDetails: ProjectDetails,
) => {
  const cacheKey = `${PROJECT_DETAILS_CACHE_PREFIX}:${projectName}`;
  await redisEphemeralClient.set(cacheKey, JSON.stringify(projectDetails), {
    EX: 1800,
  });
};

/**
 * Invalidates the cache for a project's details.
 *
 * @param projectName name of the project
 */
const invalidateProjectDetailsCache = async (projectName: string) => {
  const cacheKey = `${PROJECT_DETAILS_CACHE_PREFIX}:${projectName}`;
  await redisEphemeralClient.del(cacheKey);
};

export {
  getProjectDetailsFromCache,
  saveProjectDetailsToCache,
  invalidateProjectDetailsCache,
};
