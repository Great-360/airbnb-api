import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const port = Number(process.env.PORT) || 3000;
const ensureVersionedApiUrl = (baseUrl: string): string =>
  /\/api\/v1\/?$/.test(baseUrl) ? baseUrl.replace(/\/$/, '') : `${baseUrl.replace(/\/$/, '')}/api/v1`;

const apiUrl = ensureVersionedApiUrl(process.env.API_URL || `http://localhost:${port}`);
const docsBaseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
const versionedDocsPath = '/api/v1/api-docs';
const versionedDocsJsonPath = '/api/v1/api-docs.json';

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
  app.use(versionedDocsPath, swaggerUi.serve, swaggerUi.setup(undefined, { swaggerOptions: { url: versionedDocsJsonPath } }));
  app.get(versionedDocsJsonPath, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(getSpecs());
  });
  // Backward compatibility for existing bookmarks/integrations.
  app.get('/api-docs', (_req, res) => {
    res.redirect(302, versionedDocsPath);
  });
  app.get('/api-docs.json', (_req, res) => {
    res.redirect(302, versionedDocsJsonPath);
  });
  console.log(`Swagger docs available at ${docsBaseUrl}${versionedDocsPath}`);
}

