#!/bin/bash
set -e

# Checks if application image is specified
if [ -z "$APPLICATION_IMAGE" ]; then
  echo "[ERROR] APPLICATION_IMAGE variable not set."
  exit 1
fi

# Logs into GHCR using provided credentials (from GitHub CI/CD)
echo "Logging into GitHub Container Registry..."
echo "${GHCR_PAT}" | docker login ghcr.io -u "${GHCR_USER}" --password-stdin

# Pulls application image
echo "Pulling image: $APPLICATION_IMAGE"
docker pull "$APPLICATION_IMAGE"

# Changes directory to where the deployment files are
cd "/opt/rcb-deployments/$PROJECT_NAME"

# Replaces placeholder string '${APPLICATION_IMAGE}' with the actual image within compose file.
echo "Injecting image to override docker compose file..."
sed -i "s|\${APPLICATION_IMAGE}|$APPLICATION_IMAGE|g" ./docker-compose.override.yml

# Tears down existing containers
echo "Stopping existing containers..."
docker compose -p "$PROJECT_NAME" down

# Brings up new containers
echo "Starting new containers..."
docker compose -p "$PROJECT_NAME" up -d --build

# Cleans up unused docker images
echo "Pruning unused Docker images..."
docker image prune -f

# Announces deployment complete
echo "Deployment complete."