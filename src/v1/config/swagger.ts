import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const port = Number(process.env.PORT) || 3000;
const apiUrl = process.env.API_URL || `http://localhost:${port}/api/v1`;
const docsBaseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airbnb API',
      version: '1.0.0',
      description:
        'A RESTful API for an Airbnb-like platform. Supports user authentication, property listings, bookings, and photo uploads.',
    },
    servers: [
      {
        url: apiUrl,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/v1/routes/*.ts'],
};

let cachedSpecs: object | null = null;

function getSpecs(): object {
  if (!cachedSpecs) {
    cachedSpecs = swaggerJsdoc(options);
  }
  return cachedSpecs;
}

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, { swaggerOptions: { url: '/api-docs.json' } }));
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(getSpecs());
  });
  console.log(`Swagger docs available at ${docsBaseUrl}/api-docs`);
}

