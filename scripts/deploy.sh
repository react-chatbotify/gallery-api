#!/bin/bash
set -e

# Checks if APPLICATION_API_IMAGE is specified
if [ -z "$APPLICATION_API_IMAGE" ]; then
  echo "[ERROR] API_IMAGE variable not set."
  exit 1
fi

# Checks if APPLICATION_JOBS_IMAGE is specified
if [ -z "$APPLICATION_JOBS_IMAGE" ]; then
  echo "[ERROR] JOBS_IMAGE variable not set."
  exit 1
fi

# Logs into GHCR using provided credentials (from GitHub CI/CD)
echo "Logging into GitHub Container Registry..."
echo "${GHCR_PAT}" | docker login ghcr.io -u "${GHCR_USER}" --password-stdin

# Pulls application images
echo "Pulling image: $APPLICATION_API_IMAGE"
docker pull "$APPLICATION_API_IMAGE"
echo "Pulling image: $APPLICATION_JOBS_IMAGE"
docker pull "$APPLICATION_JOBS_IMAGE"

# Changes directory to where the deployment files are
cd "/opt/rcb-deployments/$PROJECT_NAME"

# Replaces placeholder string '${APPLICATION_API_IMAGE}' and '${APPLICATION_JOBS_IMAGE}' with the actual image within compose file.
echo "Injecting image to override docker compose file..."
sed -i "s|\${APPLICATION_API_IMAGE}|$APPLICATION_API_IMAGE|g" ./docker/docker-compose.override.yml
sed -i "s|\${APPLICATION_JOBS_IMAGE}|$APPLICATION_JOBS_IMAGE|g" ./docker/docker-compose.override.yml

# Tears down existing containers
echo "Stopping existing containers..."
docker compose -p "$PROJECT_NAME" down

# Brings up new containers
echo "Starting new containers..."
docker compose -p "$PROJECT_NAME" --env-file ./config/env/.env -f ./docker/docker-compose.yml -f ./docker/docker-compose.override.yml up -d --build

# Cleans up unused docker images
echo "Pruning unused Docker images..."
docker image prune -f

# Announces deployment complete
echo "Deployment complete."