const userPaths = {
  "/api/v1/users/profile": {
    get: {
      tags: ["Users Module"],
      summary: "Retrieves the user profile information.",
      description: "Fetches the user's profile data if the user is authorized.",
      parameters: [
        {
          in: "query",
          name: "userId",
          schema: {
            type: "string",
          },
          required: false,
          description: "The ID of the user whose profile is being requested.",
        },
      ],
      responses: {
        200: {
          description: "User profile data retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "The user's unique ID.",
                  },
                  role: {
                    type: "string",
                    description: "The user's role.",
                  },
                  name: {
                    type: "string",
                    description: "The user's name.",
                  },
                  email: {
                    type: "string",
                    description: "The user's email address.",
                  },
                  handle: {
                    type: "string",
                    description:
                      "The user's handle or username on the provider platform.",
                  },
                  avatar_url: {
                    type: "string",
                    description: "The URL of the user's avatar image.",
                  },
                  status: {
                    type: "string",
                    description: "The user's status, if any.",
                  },
                  location: {
                    type: "string",
                    description: "The user's location.",
                  },
                  profile_url: {
                    type: "string",
                    description: "The URL of the user's profile.",
                  },
                  provider: {
                    type: "string",
                    description: "The OAuth provider used (e.g., GitHub).",
                  },
                  provider_user_id: {
                    type: "string",
                    description:
                      "The user's ID as provided by the OAuth provider.",
                  },
                },
              },
            },
          },
        },
        403: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message indicating unauthorized access.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/themes": {
    get: {
      tags: ["Users Module"],
      summary: "Retrieves themes belonging to the user.",
      description:
        "Fetches the list of themes that belong to the user if the user is authorized.",
      parameters: [
        {
          in: "query",
          name: "userId",
          schema: {
            type: "string",
          },
          required: false,
          description: "The ID of the user whose themes are being requested.",
        },
      ],
      responses: {
        200: {
          description: "User's themes retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "The unique ID of the theme.",
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
                      description: "The current version of the theme.",
                    },
                  },
                },
              },
            },
          },
        },
        403: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message indicating unauthorized access.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/themes/favorited": {
    get: {
      tags: ["Users Module"],
      summary: "Retrieves themes favorited by the user.",
      description:
        "Fetches the list of themes favorited by the user if the user is authorized.",
      parameters: [
        {
          in: "query",
          name: "userId",
          schema: {
            type: "string",
          },
          required: false,
          description:
            "The ID of the user whose favorited themes are being requested.",
        },
      ],
      responses: {
        200: {
          description: "User's favorited themes retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "The unique ID of the favorited theme.",
                    },
                    name: {
                      type: "string",
                      description: "The name of the favorited theme.",
                    },
                    description: {
                      type: "string",
                      description:
                        "A brief description of the favorited theme.",
                    },
                    version: {
                      type: "string",
                      description:
                        "The current version of the favorited theme.",
                    },
                  },
                },
              },
            },
          },
        },
        403: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message indicating unauthorized access.",
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Users Module"],
      summary: "Adds a theme to user's favorites.",
      description:
        "Adds the specified theme to the user's list of favorited themes.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                theme_id: {
                  type: "string",
                  description: "The ID of the theme to be added to favorites.",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Theme added to favorites successfully.",
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
        404: {
          description: "Theme not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message indicating the theme was not found.",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Theme already favorited.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message indicating the theme is already in the user's favorites.",
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal server error occurred while adding theme to favorites.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message indicating a server error occurred.",
                  },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Users Module"],
      summary: "Removes a theme from user's favorites.",
      description:
        "Removes the specified theme from the user's list of favorited themes.",
      parameters: [
        {
          in: "query",
          name: "theme_id",
          schema: {
            type: "string",
          },
          required: true,
          description: "The ID of the theme to be removed from favorites.",
        },
      ],
      responses: {
        200: {
          description: "Theme removed from favorites successfully.",
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
        404: {
          description: "Favorite theme not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message indicating the favorite theme was not found.",
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal server error occurred while removing theme from favorites.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message indicating a server error occurred.",
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

export default userPaths;
