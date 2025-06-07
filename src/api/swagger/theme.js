const themePaths = {
  '/api/v1/themes/': {
    get: {
      tags: ['Themes Module'],
      summary: 'Retrieves a list of themes.',
      description: 'Fetches a paginated list of themes with an optional search query.',
      parameters: [
        {
          in: 'query',
          name: 'pageSize',
          schema: { type: 'integer', default: 30 },
          required: false,
          description: 'The number of themes to retrieve per page.',
        },
        {
          in: 'query',
          name: 'pageNum',
          schema: { type: 'integer', default: 1 },
          required: false,
          description: 'The page number to retrieve.',
        },
        {
          in: 'query',
          name: 'searchQuery',
          schema: { type: 'string' },
          required: false,
          description: 'A search query to filter themes by name or description.',
        },
        {
          in: 'query',
          name: 'sortBy',
          schema: { type: 'string', default: 'updatedAt' },
          required: false,
          description: 'The field to sort the results with.',
        },
        {
          in: 'query',
          name: 'sortDirection',
          schema: { type: 'string', default: 'DESC' },
          required: false,
          description: 'The direction to sort in.',
        },
      ],
      responses: {
        200: {
          description: 'A list of themes retrieved successfully.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: true,
                message: 'Themes fetched successfully.',
                data: [
                  {
                    id: 'terminal',
                    name: 'Terminal',
                    description: 'For the geeks!',
                    favoritesCount: '10',
                    createdAt: '2024-08-07T18:43:21.000Z',
                    updatedAt: '2024-08-07T18:43:21.000Z',
                    userId: null,
                  },
                ],
                errors: [],
              },
            },
          },
        },
        500: {
          description: 'Internal server error occurred while fetching themes.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to fetch themes.',
                data: null,
                errors: [],
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/themes/{theme_id}': {
    get: {
      tags: ['Themes Module'],
      summary: 'Retrieves data for a specific theme.',
      description:
        'Fetches details for a specific theme by its ID. Authentication is optional but provides additional user-specific data if present.',
      parameters: [
        {
          in: 'path',
          name: 'theme_id',
          schema: { type: 'string' },
          required: true,
          description: 'The ID of the theme to retrieve.',
        },
      ],
      responses: {
        200: {
          description: 'Theme data retrieved successfully.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: true,
                message: 'Theme fetched successfully.',
                data: {
                  id: 'terminal',
                  name: 'Terminal',
                  description: 'For the geeks!',
                  favoritesCount: '10',
                  createdAt: '2024-08-07T18:43:21.000Z',
                  updatedAt: '2024-08-07T18:43:21.000Z',
                  userId: null,
                },
                errors: [],
              },
            },
          },
        },
        404: {
          description: 'Theme not found.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Theme not found.',
                data: null,
                errors: [],
              },
            },
          },
        },
        500: {
          description: 'Internal server error occurred while fetching the theme.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to fetch theme, please try again.',
                data: null,
                errors: [],
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/themes/versions': {
    get: {
      tags: ['Themes Module'],
      summary: 'Retrieves theme versions.',
      description: 'Fetches all published versions for a specific theme.',
      parameters: [
        {
          in: 'query',
          name: 'themeId',
          schema: { type: 'string' },
          required: true,
          description: 'The ID of the theme for which versions are to be retrieved.',
        },
      ],
      responses: {
        200: {
          description: 'A list of theme versions retrieved successfully.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: true,
                message: 'Theme versions fetched successfully.',
                data: [
                  {
                    id: '4019665a-c621-4a7b-ba8d-88572f72b5bc',
                    themeId: 'terminal',
                    version: '1.0.0',
                    createdAt: '2024-08-07T18:43:21.000Z',
                  },
                ],
                errors: [],
              },
            },
          },
        },
        500: {
          description: 'Internal server error occurred while fetching theme versions.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to fetch theme versions.',
                data: null,
                errors: [],
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/themes/publish': {
    post: {
      tags: ['Themes Module'],
      summary: 'Publishes a new theme.',
      description: 'Publishes a new theme or updates an existing one. Handles versioning and validation.',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                styles: {
                  type: 'string',
                  format: 'binary',
                  description: 'CSS file for the theme (.css).',
                },
                options: {
                  type: 'string',
                  format: 'binary',
                  description: 'JSON file containing theme options (.json).',
                },
                display: {
                  type: 'string',
                  format: 'binary',
                  description: 'PNG file for the theme display image (.png).',
                },
                themeId: {
                  type: 'string',
                  description:
                    "The ID of the theme being published (e.g., 'my-theme'). Required if updating an existing theme.",
                },
                name: {
                  type: 'string',
                  description: "The name of the theme (e.g., 'My Awesome Theme'). Required for new themes.",
                },
                description: {
                  type: 'string',
                  description: 'A brief description of the theme.',
                },
                version: {
                  type: 'string',
                  description: "The version of the theme being published (e.g., '1.0.0'). Required.",
                },
              },
              required: ['name', 'version', 'styles', 'options', 'display'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Theme published successfully.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: true,
                message: 'Theme queued for publishing.',
                data: {
                  id: 'terminal',
                  name: 'Terminal',
                  description: 'For the geeks!',
                  version: '1.1.0',
                },
                errors: [],
              },
            },
          },
        },
        400: {
          description: 'Bad request due to validation failure.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to publish theme, validation failed.',
                data: null,
                errors: [],
              },
            },
          },
        },
        500: {
          description: 'Internal server error occurred while publishing the theme.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to publish theme, please try again.',
                data: null,
                errors: [],
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/themes/unpublish': {
    delete: {
      tags: ['Themes Module'],
      summary: 'Unpublishes an existing theme.',
      description: 'Removes a theme from publication.',
      parameters: [
        {
          in: 'query',
          name: 'themeId',
          schema: { type: 'string' },
          required: true,
          description: 'The ID of the theme to unpublish.',
        },
      ],
      responses: {
        200: {
          description: 'Theme unpublished successfully.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: true,
                message: 'Theme queued for unpublishing.',
                data: {
                  id: 'terminal',
                  name: 'Terminal',
                  description: 'For the geeks!',
                  version: '1.1.0',
                },
                errors: [],
              },
            },
          },
        },
        400: {
          description: 'Feature not allowed or bad request.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Feature not available yet.',
                data: null,
                errors: [],
              },
            },
          },
        },
        404: {
          description: 'Theme not found.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to unpublish theme, the theme does not exist.',
                data: null,
                errors: [],
              },
            },
          },
        },
        500: {
          description: 'Internal server error occurred while unpublishing the theme.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to unpublish theme, please try again.',
                data: null,
                errors: [],
              },
            },
          },
        },
      },
    },
  },
};

export default themePaths;
