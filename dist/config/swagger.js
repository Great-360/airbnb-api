import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Airbnb API',
            version: '1.0.0',
            description: 'A RESTful API for an Airbnb-like platform. Supports user authentication, property listings, bookings, and photo uploads.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local development server',
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
    apis: ['./src/routes/*.ts'],
};
const specs = swaggerJsdoc(options);
export function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
    console.log(`Swagger docs available at http://localhost:3000/api-docs`);
}
//# sourceMappingURL=swagger.js.map