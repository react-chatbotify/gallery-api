const userPaths = {
	"/api/v1/users/profile": {
		"get": {
			"tags": [
				"Users Module"
			],
			"summary": "Retrieves the user profile information.",
			"description": "Fetches the user's profile data if the user is authorized.",
			"parameters": [
				{
					"in": "query",
					"name": "userId",
					"schema": {
						"type": "string"
					},
					"required": false,
					"description": "The ID of the user whose profile is being requested."
				}
			],
			"responses": {
				"200": {
					"description": "User profile data retrieved successfully.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": true,
								"message": "User data fetched successfully.",
								"data": {
									"id": "user123",
									"role": "admin",
									"name": "John Doe",
									"email": "john@example.com",
									"handle": "johndoe",
									"avatarUrl": "http://example.com/avatar.jpg",
									"status": "active",
									"location": "USA",
									"profileUrl": "http://example.com/profile/johndoe",
									"provider": "github",
									"providerUserId": "github123"
								},
								"errors": []
							}
						}
					}
				},
				"403": {
					"description": "Unauthorized access.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Unauthorized access.",
								"data": null,
								"errors": []
							}
						}
					}
				}
			}
		}
	},
	"/api/v1/users/plugins": {
		"get": {
			"tags": ["Users Module"],
			"summary": "Retrieves plugins belonging to the user.",
			"description": "Fetches the list of plugins that the authenticated user owns or has created.",
			"parameters": [
				{
					"in": "query",
					"name": "userId",
					"schema": { "type": "string" },
					"required": false,
					"description": "The ID of the user whose owned plugins are being requested. Defaults to the authenticated user if not provided or if the authenticated user is not an admin."
				}
			],
			"responses": {
				"200": {
					"description": "User's owned plugins retrieved successfully.",
					"content": {
						"application/json": {
							"schema": { "$ref": "#/components/schemas/ApiResult" },
							"example": {
								"success": true,
								"message": "User owned plugins fetched successfully.",
								"data": [
									{
										"id": "plugin456",
										"name": "My Awesome Plugin",
										"description": "A plugin I created.",
										"version": "1.0.0"
									}
								],
								"errors": []
							}
						}
					}
				},
				"403": {
					"description": "Unauthorized access.",
					"content": {
						"application/json": {
							"schema": { "$ref": "#/components/schemas/ApiResult" },
							"example": {
								"success": false,
								"message": "Unauthorized access.",
								"data": null,
								"errors": []
							}
						}
					}
				}
			}
		}
	},
	"/api/v1/users/themes": {
		"get": {
			"tags": [
				"Users Module"
			],
			"summary": "Retrieves themes belonging to the user.",
			"description": "Fetches the list of themes that belong to the user if the user is authorized.",
			"parameters": [
				{
					"in": "query",
					"name": "userId",
					"schema": {
						"type": "string"
					},
					"required": false,
					"description": "The ID of the user whose themes are being requested."
				}
			],
			"responses": {
				"200": {
					"description": "User's themes retrieved successfully.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": true,
								"message": "User themes fetched successfully.",
								"data": [
									{
										"id": "terminal",
										"name": "Terminal",
										"description": "For the geeks!",
										"version": "1.0.0"
									}
								],
								"errors": []
							}
						}
					}
				},
				"403": {
					"description": "Unauthorized access.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Unauthorized access.",
								"data": null,
								"errors": []
							}
						}
					}
				}
			}
		}
	},
	"/api/v1/users/themes/favorited": {
		"get": {
			"tags": [
				"Users Module"
			],
			"summary": "Retrieves themes favorited by the user.",
			"description": "Fetches the list of themes favorited by the user if the user is authorized.",
			"parameters": [
				{
					"in": "query",
					"name": "userId",
					"schema": {
						"type": "string"
					},
					"required": false,
					"description": "The ID of the user whose favorited themes are being requested."
				}
			],
			"responses": {
				"200": {
					"description": "User's favorited themes retrieved successfully.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": true,
								"message": "User favorite themes fetched successfully.",
								"data": [
									{
										"id": "theme123",
										"name": "Dark Mode",
										"description": "A sleek dark theme.",
										"version": "1.0.0"
									}
								],
								"errors": []
							}
						}
					}
				},
				"403": {
					"description": "Unauthorized access.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Unauthorized access.",
								"data": null,
								"errors": []
							}
						}
					}
				}
			}
		},
		"post": {
			"tags": [
				"Users Module"
			],
			"summary": "Adds a theme to user's favorites.",
			"description": "Adds the specified theme to the user's list of favorited themes.",
			"requestBody": {
				"required": true,
				"content": {
					"application/json": {
						"schema": {
							"type": "object",
							"properties": {
								"themeId": {
									"type": "string",
									"description": "The ID of the theme to be added to favorites."
								}
							}
						}
					}
				}
			},
			"responses": {
				"201": {
					"description": "Theme added to favorites successfully.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": true,
								"message": "Added theme to favorites successfully.",
								"data": {
									"id": "terminal",
									"name": "Terminal",
									"description": "For the geeks!",
									"version": "1.0.0"
								},
								"errors": []
							}
						}
					}
				},
				"404": {
					"description": "Theme not found.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Theme not found.",
								"data": null,
								"errors": []
							}
						}
					}
				},
				"400": {
					"description": "Theme already favorited.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Theme already favorited.",
								"data": null,
								"errors": []
							}
						}
					}
				},
				"500": {
					"description": "Internal server error occurred while adding theme to favorites.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Failed to add favorite theme.",
								"data": null,
								"errors": []
							}
						}
					}
				}
			}
		},
		"delete": {
			"tags": [
				"Users Module"
			],
			"summary": "Removes a theme from user's favorites.",
			"description": "Removes the specified theme from the user's list of favorited themes.",
			"parameters": [
				{
					"in": "query",
					"name": "themeId",
					"schema": {
						"type": "string"
					},
					"required": true,
					"description": "The ID of the theme to be removed from favorites."
				}
			],
			"responses": {
				"200": {
					"description": "Theme removed from favorites successfully.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": true,
								"message": "Removed theme from favorites successfully.",
								"data": {
									"id": "terminal",
									"name": "Terminal",
									"description": "For the geeks!",
									"version": "1.0.0"
								},
								"errors": []
							}
						}
					}
				},
				"404": {
					"description": "Favorite theme not found.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Favorite theme not found.",
								"data": null,
								"errors": []
							}
						}
					}
				},
				"500": {
					"description": "Internal server error occurred while removing theme from favorites.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Failed to remove favorite theme.",
								"data": null,
								"errors": []
							}
						}
					}
				}
			}
		}
	},
	"/api/v1/users/plugins/favorited": {
        "get": {
            "tags": ["Users Module"],
            "summary": "Retrieves plugins favorited by the user.",
            "description": "Fetches the list of plugins favorited by the user if the user is authorized.",
            "parameters": [
                {
                    "in": "query",
                    "name": "userId",
                    "schema": {
                        "type": "string"
                    },
                    "required": false,
                    "description": "The ID of the user whose favorited plugins are being requested."
                }
            ],
            "responses": {
                "200": {
                    "description": "User's favorited plugins retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": true,
                                "message": "User favorite plugins fetched successfully.",
                                "data": [
                                    {
                                        "id": "plugin123",
                                        "name": "Code Formatter",
                                        "description": "Formats code automatically.",
                                        "version": "2.1.0"
                                    }
                                ],
                                "errors": []
                            }
                        }
                    }
                },
                "403": {
                    "description": "Unauthorized access.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": false,
                                "message": "Unauthorized access.",
                                "data": null,
                                "errors": []
                            }
                        }
                    }
                }
            }
        },
        "post": {
            "tags": ["Users Module"],
            "summary": "Adds a plugin to user's favorites.",
            "description": "Adds the specified plugin to the user's list of favorited plugins.",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "pluginId": {
                                    "type": "string",
                                    "description": "The ID of the plugin to be added to favorites."
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "Plugin added to favorites successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": true,
                                "message": "Added plugin to favorites successfully.",
                                "data": {
                                    "id": "plugin123",
                                    "name": "Code Formatter",
                                    "description": "Formats code automatically.",
                                    "version": "2.1.0"
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
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": false,
                                "message": "Plugin not found.",
                                "data": null,
                                "errors": []
                            }
                        }
                    }
                },
                "400": {
                    "description": "Plugin already favorited.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": false,
                                "message": "Plugin already favorited.",
                                "data": null,
                                "errors": []
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error occurred while adding plugin to favorites.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": false,
                                "message": "Failed to add favorite plugin.",
                                "data": null,
                                "errors": []
                            }
                        }
                    }
                }
            }
        },
        "delete": {
            "tags": ["Users Module"],
            "summary": "Removes a plugin from user's favorites.",
            "description": "Removes the specified plugin from the user's list of favorited plugins.",
            "parameters": [
                {
                    "in": "query",
                    "name": "pluginId",
                    "schema": {
                        "type": "string"
                    },
                    "required": true,
                    "description": "The ID of the plugin to be removed from favorites."
                }
            ],
            "responses": {
                "200": {
                    "description": "Plugin removed from favorites successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": true,
                                "message": "Removed plugin from favorites successfully.",
                                "data": {
                                    "id": "plugin123",
                                    "name": "Code Formatter",
                                    "description": "Formats code automatically.",
                                    "version": "2.1.0"
                                },
                                "errors": []
                            }
                        }
                    }
                },
                "404": {
                    "description": "Favorite plugin not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": false,
                                "message": "Favorite plugin not found.",
                                "data": null,
                                "errors": []
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error occurred while removing plugin from favorites.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiResult"
                            },
                            "example": {
                                "success": false,
                                "message": "Failed to remove favorite plugin.",
                                "data": null,
                                "errors": []
                            }
                        }
                    }
                }
            }
        }
    },
	"/api/v1/users/author-agreement": {
		"post": {
			"tags": [
				"Users Module"
			],
			"summary": "Sets the user's acceptance of the author agreement.",
			"description": "Updates the user's record to indicate whether they have accepted the author agreement. If `accept` is true, the agreement date is recorded. If false, the agreement status is reset.",
			"requestBody": {
				"required": true,
				"content": {
					"application/json": {
						"schema": {
							"type": "object",
							"properties": {
								"accept": {
									"type": "boolean",
									"description": "Indicates whether the user accepts or declines the author agreement. If true, the agreement date is recorded; if false, the status is reset."
								}
							},
							"required": ["accept"]
						},
						"example": {
							"accept": true
						}
					}
				}
			},
			"responses": {
				"200": {
					"description": "Author agreement status updated successfully.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": true,
								"message": "Author agreement accepted successfully.",
								"data": null,
								"errors": []
							}
						}
					}
				},
				"400": {
					"description": "Invalid input or request.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Invalid request. Accept must be a boolean.",
								"data": null,
								"errors": []
							}
						}
					}
				},
				"500": {
					"description": "Internal server error occurred.",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ApiResult"
							},
							"example": {
								"success": false,
								"message": "Failed to update author agreement status.",
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

export default userPaths;
