const themePaths = {
  "/api/v1/themes/": {
    get: {
      tags: ["Themes Module"],
      summary: "Retrieves a list of themes.",
      description:
        "Fetches a paginated list of themes with optional search query.",
      parameters: [
        {
          in: "query",
          name: "pageSize",
          schema: {
            type: "integer",
            default: 30,
          },
          required: false,
          description: "The number of themes to retrieve per page.",
        },
        {
          in: "query",
          name: "pageNum",
          schema: {
            type: "integer",
            default: 1,
          },
          required: false,
          description: "The page number to retrieve.",
        },
        {
          in: "query",
          name: "searchQuery",
          schema: {
            type: "string",
          },
          required: false,
          description:
            "A search query to filter themes by name or description.",
        },
      ],
      responses: {
        200: {
          description: "A list of themes retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "The name of the theme.",
                    },
                    description: {
                      type: "string",
                      description: "A brief description of the theme.",
                    },
                    author: {
                      type: "string",
                      description: "The author of the theme.",
                    },
                    github: {
                      type: "string",
                      description: "The GitHub repository link for the theme.",
                    },
                    tags: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      description: "Tags associated with the theme.",
                    },
                    version: {
                      type: "string",
                      description: "The current version of the theme.",
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error occurred while fetching themes.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description: "Error message",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/themes/versions": {
    get: {
      tags: ["Themes Module"],
      summary: "Retrieves theme versions.",
      description: "Fetches all published versions for a specific theme.",
      parameters: [
        {
          in: "query",
          name: "themeId",
          schema: {
            type: "string",
          },
          required: true,
          description:
            "The ID of the theme for which versions are to be retrieved.",
        },
      ],
      responses: {
        200: {
          description: "A list of theme versions retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description:
                        "The unique identifier for this theme version.",
                    },
                    theme_id: {
                      type: "string",
                      description:
                        "The ID of the theme this version belongs to.",
                    },
                    version: {
                      type: "string",
                      description: "The version number of the theme.",
                    },
                    created_at: {
                      type: "string",
                      format: "date-time",
                      description: "The date when this version was released.",
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal server error occurred while fetching theme versions.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description: "Error message",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/themes/publish": {
    post: {
      tags: ["Themes Module"],
      summary: "Publishes a new theme.",
      description:
        "Publishes a new theme or updates an existing one. Handles versioning and validation.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                styles: {
                  type: "string",
                  format: "binary",
                  description: "CSS file for the theme.",
                },
                options: {
                  type: "string",
                  format: "binary",
                  description: "JSON file containing theme options.",
                },
                display: {
                  type: "string",
                  format: "binary",
                  description: "PNG file for the theme display image.",
                },
              },
            },
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  theme_id: {
                    type: "string",
                    description: "The ID of the theme being published.",
                  },
                  name: {
                    type: "string",
                    description: "The name of the theme.",
                  },
                  description: {
                    type: "string",
                    description: "A brief description of the theme.",
                  },
                  version: {
                    type: "string",
                    description: "The version of the theme being published.",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Theme published successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      description: "Success message.",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request due to validation failure.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      description: "Validation error message.",
                    },
                  },
                },
              },
            },
          },
          500: {
            description:
              "Internal server error occurred while publishing the theme.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      description: "Error message",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/themes/unpublish": {
    delete: {
      tags: ["Themes Module"],
      summary: "Unpublishes an existing theme.",
      description: "Removes a theme from publication.",
      parameters: [
        {
          in: "query",
          name: "theme_id",
          schema: {
            type: "string",
          },
          required: true,
          description: "The ID of the theme to unpublish.",
        },
      ],
      responses: {
        200: {
          description: "Theme unpublished successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "Success message.",
                  },
                },
              },
            },
          },
          400: {
            description: "Feature not allowed or bad request.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      description:
                        "Error message describing why the operation failed.",
                    },
                  },
                },
              },
            },
          },
          500: {
            description:
              "Internal server error occurred while unpublishing the theme.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      description: "Error message",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default themePaths;
