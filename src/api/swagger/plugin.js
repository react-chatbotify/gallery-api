const pluginPaths = {
  '/api/v1/plugins/': {
    get: {
      tags: ['Plugins Module'],
      summary: 'Retrieves a list of plugins.',
      description: 'Fetches a paginated list of plugins with an optional search query.',
      parameters: [
        {
          in: 'query',
          name: 'pageSize',
          schema: { type: 'integer', default: 30 },
          required: false,
          description: 'The number of plugins to retrieve per page.',
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
          description: 'A search query to filter plugins by name or description.',
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
          description: 'A list of plugins retrieved successfully.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: true,
                message: 'Plugins fetched successfully.',
                data: [
                  {
                    id: 'plugin-1',
                    name: 'Example Plugin',
                    description: 'A sample plugin.',
                    version: '1.0.0',
                    createdAt: '2024-08-07T18:43:21.000Z',
                    updatedAt: '2024-08-07T18:43:21.000Z',
                  },
                ],
                errors: [],
              },
            },
          },
        },
        500: {
          description: 'Internal server error occurred while fetching plugins.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to fetch plugins.',
                data: null,
                errors: [],
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/plugins/{plugin_id}': {
    get: {
      tags: ['Plugins Module'],
      summary: 'Retrieves data for a specific plugin.',
      description:
        'Fetches details for a specific plugin by its ID. Authentication is optional but provides additional user-specific data if present.',
      parameters: [
        {
          in: 'path',
          name: 'plugin_id',
          schema: { type: 'string' },
          required: true,
          description: 'The ID of the plugin to retrieve.',
        },
      ],
      responses: {
        200: {
          description: 'Plugin data retrieved successfully.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              default: '@rcb-plugins/llm-connector',
              example: {
                success: true,
                message: 'Plugin data fetched successfully.',
                data: {
                  id: '@rcb-plugins/llm-connector',
                  name: '@rcb-plugins/llm-connector',
                  description:
                    'A generic LLM connector for integrating Large Language Models (LLMs) in React ChatBotify!',
                  favoritesCount: 0,
                  packageUrl: 'https://www.npmjs.com/package/@rcb-plugins/llm-connector',
                  status: 'SYNC',
                  createdAt: '2024-08-07T18:43:21.000Z',
                  updatedAt: '2024-08-07T18:43:21.000Z',
                },
                errors: [],
              },
            },
          },
        },
        404: {
          description: 'Plugin not found.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Plugin not found.',
                data: null,
                errors: [],
              },
            },
          },
        },
        500: {
          description: 'Internal server error occurred while fetching the plugin.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to fetch plugin, please try again.',
                data: null,
                errors: [],
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/plugins/versions': {
    get: {
      tags: ['Plugins Module'],
      summary: 'Retrieves plugin versions.',
      description: 'Fetches all published versions for a specific plugin.',
      parameters: [
        {
          in: 'query',
          name: 'pluginId',
          schema: { type: 'string' },
          required: true,
          description: 'The ID of the plugin for which versions are to be retrieved.',
        },
      ],
      responses: {
        200: {
          description: 'A list of plugin versions retrieved successfully.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: true,
                message: 'Plugin versions fetched successfully.',
                data: [
                  {
                    id: '12345',
                    pluginId: 'plugin-1',
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
          description: 'Internal server error occurred while fetching plugin versions.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResult' },
              example: {
                success: false,
                message: 'Failed to fetch plugin versions.',
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

export default pluginPaths;
