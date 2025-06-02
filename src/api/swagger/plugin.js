const pluginPaths = {
	"/api/v1/plugins/": {
			"get": {
					"tags": ["Plugins Module"],
					"summary": "Retrieves a list of plugins.",
					"description": "Fetches a paginated list of plugins with an optional search query.",
					"parameters": [
							{
									"in": "query",
									"name": "pageSize",
									"schema": { "type": "integer", "default": 30 },
									"required": false,
									"description": "The number of plugins to retrieve per page."
							},
							{
									"in": "query",
									"name": "pageNum",
									"schema": { "type": "integer", "default": 1 },
									"required": false,
									"description": "The page number to retrieve."
							},
							{
									"in": "query",
									"name": "searchQuery",
									"schema": { "type": "string" },
									"required": false,
									"description": "A search query to filter plugins by name or description."
							},
							{
								"in": "query",
								"name": "sortBy",
								"schema": { "type": "string", "default": "updatedAt" },
								"required": false,
								"description": "The field to sort the results with."
							},
							{
								"in": "query",
								"name": "sortDirection",
								"schema": { "type": "string", "default": "DESC" },
								"required": false,
								"description": "The direction to sort in."
							}
					],
					"responses": {
							"200": {
									"description": "A list of plugins retrieved successfully.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": true,
															"message": "Plugins fetched successfully.",
															"data": [
																	{
																			"id": "plugin-1",
																			"name": "Example Plugin",
																			"description": "A sample plugin.",
																			"version": "1.0.0",
																			"createdAt": "2024-08-07T18:43:21.000Z",
																			"updatedAt": "2024-08-07T18:43:21.000Z"
																	}
															],
															"errors": []
													}
											}
									}
							},
							"500": {
									"description": "Internal server error occurred while fetching plugins.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": false,
															"message": "Failed to fetch plugins.",
															"data": null,
															"errors": []
													}
											}
									}
							}
					}
			}
	},
	"/api/v1/plugins/{plugin_id}": {
		"get": {
			"tags": ["Plugins Module"],
			"summary": "Retrieves data for a specific plugin.",
			"description": "Fetches details for a specific plugin by its ID. Authentication is optional but provides additional user-specific data if present.",
			"parameters": [
				{
					"in": "path",
					"name": "plugin_id",
					"schema": { "type": "string" },
					"required": true,
					"description": "The ID of the plugin to retrieve."
				}
			],
			"responses": {
				"200": {
					"description": "Plugin data retrieved successfully.",
					"content": {
						"application/json": {
							"schema": { "$ref": "#/components/schemas/ApiResult" },
							"example": {
								"success": true,
								"message": "Plugin fetched successfully.",
								"data": {
									"id": "plugin-1",
									"name": "Example Plugin",
									"description": "A sample plugin.",
									"version": "1.0.0",
									"createdAt": "2024-08-07T18:43:21.000Z",
									"updatedAt": "2024-08-07T18:43:21.000Z"
								},
								"errors": []
							}
						}
					}
				},
				"404": {
					"description": "Plugin not found.",
					"content": {
						"application/json": {
							"schema": { "$ref": "#/components/schemas/ApiResult" },
							"example": {
								"success": false,
								"message": "Plugin not found.",
								"data": null,
								"errors": []
							}
						}
					}
				},
				"500": {
					"description": "Internal server error occurred while fetching the plugin.",
					"content": {
						"application/json": {
							"schema": { "$ref": "#/components/schemas/ApiResult" },
							"example": {
								"success": false,
								"message": "Failed to fetch plugin, please try again.",
								"data": null,
								"errors": []
							}
						}
					}
				}
			}
		}
	},
	"/api/v1/plugins/versions": {
			"get": {
					"tags": ["Plugins Module"],
					"summary": "Retrieves plugin versions.",
					"description": "Fetches all published versions for a specific plugin.",
					"parameters": [
							{
									"in": "query",
									"name": "pluginId",
									"schema": { "type": "string" },
									"required": true,
									"description": "The ID of the plugin for which versions are to be retrieved."
							}
					],
					"responses": {
							"200": {
									"description": "A list of plugin versions retrieved successfully.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": true,
															"message": "Plugin versions fetched successfully.",
															"data": [
																	{
																			"id": "12345",
																			"pluginId": "plugin-1",
																			"version": "1.0.0",
																			"createdAt": "2024-08-07T18:43:21.000Z"
																	}
															],
															"errors": []
													}
											}
									}
							},
							"500": {
									"description": "Internal server error occurred while fetching plugin versions.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": false,
															"message": "Failed to fetch plugin versions.",
															"data": null,
															"errors": []
													}
											}
									}
							}
					}
			}
	},
	"/api/v1/plugins/publish": {
			"post": {
					"tags": ["Plugins Module"],
					"summary": "Publishes a new plugin.",
					"description": "Publishes a new plugin or updates an existing one. Handles versioning and validation.",
					"requestBody": {
							"required": true,
							"content": {
									"multipart/form-data": {
											"schema": {
													"type": "object",
													"properties": {
															"pluginId": {
																	"type": "string",
																	"description": "The ID of the plugin being published."
															},
															"name": {
																	"type": "string",
																	"description": "The name of the plugin."
															},
															"description": {
																	"type": "string",
																	"description": "A brief description of the plugin."
															},
															"packageUrl": {
																	"type": "string",
																	"description": "Url to the published package."
															},
															"file": {
																	"type": "string",
																	"format": "binary",
																	"description": "Image url for the plugin."
															}
													}
											}
									}
							}
					},
					"responses": {
							"201": {
									"description": "Plugin published successfully.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": true,
															"message": "Plugin published successfully.",
															"data": {
																	"id": "plugin-1",
																	"name": "Example Plugin",
																	"version": "1.1.0"
															},
															"errors": []
													}
											}
									}
							},
							"400": {
									"description": "Bad request due to validation failure.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": false,
															"message": "Validation failed.",
															"data": null,
															"errors": []
													}
											}
									}
							},
							"500": {
									"description": "Internal server error occurred while publishing the plugin.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": false,
															"message": "Failed to publish plugin.",
															"data": null,
															"errors": []
													}
											}
									}
							}
					}
			}
	},
	"/api/v1/plugins/unpublish": {
			"delete": {
					"tags": ["Plugins Module"],
					"summary": "Unpublishes an existing plugin.",
					"description": "Removes a plugin from publication.",
					"parameters": [
							{
									"in": "query",
									"name": "pluginId",
									"schema": { "type": "string" },
									"required": true,
									"description": "The ID of the plugin to unpublish."
							}
					],
					"responses": {
							"200": {
									"description": "Plugin unpublished successfully.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": true,
															"message": "Plugin unpublished successfully.",
															"data": {
																	"id": "plugin-1",
																	"name": "Example Plugin",
																	"version": "1.1.0"
															},
															"errors": []
													}
											}
									}
							},
							"400": {
									"description": "Feature not allowed or bad request.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": false,
															"message": "Bad request.",
															"data": null,
															"errors": []
													}
											}
									}
							},
							"404": {
									"description": "Plugin not found.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": false,
															"message": "Plugin not found.",
															"data": null,
															"errors": []
													}
											}
									}
							},
							"500": {
									"description": "Internal server error occurred while unpublishing the plugin.",
									"content": {
											"application/json": {
													"schema": { "$ref": "#/components/schemas/ApiResult" },
													"example": {
															"success": false,
															"message": "Failed to unpublish plugin.",
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

export default pluginPaths;
