import swaggerJsdoc, { SwaggerDefinition } from 'swagger-jsdoc';

const options: SwaggerDefinition = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FamMap (親子地圖) API',
      version: '1.0.0',
      description: 'A comprehensive API for family-friendly location discovery and sharing',
      contact: {
        name: 'FamMap Team',
        email: 'support@fammap.com'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.fammap.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Location: {
          type: 'object',
          required: ['id', 'name', 'address', 'coordinates', 'category'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique location identifier'
            },
            name: {
              type: 'object',
              properties: {
                zh: { type: 'string', description: 'Name in Traditional Chinese' },
                en: { type: 'string', description: 'Name in English' }
              }
            },
            address: {
              type: 'object',
              properties: {
                zh: { type: 'string' },
                en: { type: 'string' }
              }
            },
            description: {
              type: 'object',
              properties: {
                zh: { type: 'string' },
                en: { type: 'string' }
              }
            },
            coordinates: {
              type: 'object',
              required: ['lat', 'lng'],
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' }
              }
            },
            category: {
              type: 'string',
              enum: ['park', 'nursing_room', 'restaurant', 'medical'],
              description: 'Location category'
            },
            facilities: {
              type: 'array',
              items: { type: 'string' },
              description: 'Available facilities'
            },
            averageRating: {
              type: 'number',
              minimum: 0,
              maximum: 5
            },
            phoneNumber: {
              type: 'string'
            },
            pricing: {
              type: 'object',
              properties: {
                isFree: { type: 'boolean' },
                price: { type: 'string' }
              }
            }
          }
        },
        Review: {
          type: 'object',
          required: ['locationId', 'rating', 'comment'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            locationId: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5
            },
            comment: {
              type: 'string'
            },
            userName: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        User: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            displayName: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string'
            },
            code: {
              type: 'string'
            },
            details: {
              type: 'object'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
