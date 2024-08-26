const authPaths = {
  "/api/v1/auth/callback": {
    get: {
      tags: ["Authentication Module"],
      summary: "Handles the callback from OAuth provider.",
      description:
        "Processes the callback from the OAuth provider, handling authorization and redirection.",
      parameters: [
        {
          in: "query",
          name: "code",
          schema: {
            type: "string",
          },
          required: false,
          description: "The authorization code returned by the OAuth provider.",
        },
        {
          in: "query",
          name: "error",
          schema: {
            type: "string",
          },
          required: false,
          description:
            "Error message returned by the OAuth provider if the authorization fails.",
        },
      ],
      responses: {
        302: {
          description:
            "Redirects user to either the login process page or an error page.",
          headers: {
            Location: {
              description: "The URL to which the user is redirected.",
              schema: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/auth/login/process": {
    get: {
      tags: ["Authentication Module"],
      summary: "Handles the login process after OAuth callback.",
      description:
        "Uses the authorization code to fetch tokens, retrieve user data, and store them in a cache.",
      parameters: [
        {
          in: "query",
          name: "provider",
          schema: {
            type: "string",
          },
          required: true,
          description: "The OAuth provider (e.g. github).",
        },
        {
          in: "query",
          name: "key",
          schema: {
            type: "string",
          },
          required: true,
          description:
            "The encrypted key generated from the authorization code.",
        },
      ],
      responses: {
        200: {
          description: "Returns user data on successful login.",
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
                    description: "The OAuth provider used (e.g. github).",
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
        401: {
          description:
            "Unauthorized due to invalid login credentials or missing provider.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description: "A message describing the error.",
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

export default authPaths;
