const projectPaths = {
	"/api/v1/projects": {
		"get": {
			"tags": ["Project Module"],
			"summary": "Fetch project details from GitHub.",
			"description": "Retrieves information about a specific project, including a list of contributors, by querying the GitHub API.",
			"parameters": [
				{
					"in": "query",
					"name": "projectName",
					"schema": { "type": "string" },
					"required": true,
					"description": "The full name of the GitHub repository (e.g., `react-chatbotify/gallery-api`)."
				}
			],
			"responses": {
				"200": {
					"description": "Successfully retrieved project details.",
					"content": {
						"application/json": {
							"schema": {
								"type": "object",
								"properties": {
									"contributors": {
										"type": "array",
										"description": "List of contributors for the project.",
										"items": {
											"type": "object",
											"properties": {
												"avatar_url": { "type": "string", "description": "URL to the contributor's avatar." },
												"html_url": { "type": "string", "description": "URL to the contributor's GitHub profile." },
												"login": { "type": "string", "description": "Contributor's GitHub username." }
											}
										}
									}
								}
							},
							"example": {
								"contributors": [
									{
										"avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
										"html_url": "https://github.com/contributor1",
										"login": "contributor1"
									},
									{
										"avatar_url": "https://avatars.githubusercontent.com/u/67890?v=4",
										"html_url": "https://github.com/contributor2",
										"login": "contributor2"
									}
								]
							}
						}
					}
				},
				"400": {
					"description": "Invalid request due to missing or invalid parameters.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Invalid project name.",
								"data": null,
								"errors": []
							}
						}
					}
				},
				"404": {
					"description": "Project not found or no contributors available.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Project not found or no contributors.",
								"data": null,
								"errors": []
							}
						}
					}
				},
				"500": {
					"description": "Internal server error.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "An error occurred while fetching project details.",
								"data": null,
								"errors": []
							}
						}
					}
				}
			}
		}
	}
};

export default projectPaths;
