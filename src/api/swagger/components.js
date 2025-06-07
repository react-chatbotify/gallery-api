const components = {
  components: {
    schemas: {
      ApiResult: {
        oneOf: [
          {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Indicates if the operation was successful.',
                enum: [true],
              },
              message: {
                type: 'string',
                description: 'A message describing the outcome.',
              },
              data: {
                type: 'object',
                description: 'The data returned by the operation, if any.',
                nullable: true,
              },
            },
          },
          {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Indicates if the operation was successful.',
                enum: [false],
              },
              message: {
                type: 'string',
                description: 'A message describing the outcome.',
              },
              errors: {
                type: 'array',
                description: 'An array of error messages.',
                items: {
                  type: 'string',
                },
              },
              data: {
                type: 'null',
                description: 'No data returned when the operation is unsuccessful.',
              },
            },
          },
        ],
      },
    },
  },
};

export default components;
