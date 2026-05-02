import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import compression from 'compression';
import v1Router from './v1/index.js';
import { setupSwagger } from './v1/config/swagger.js';
import morgan from "morgan";

const app: Express = express();
const port = Number(process.env.PORT) || 10000;

// Apply compression middleware before all routes
app.use(compression());
app.use(express.json());

app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));

// Mount API routes BEFORE the 404 handler
app.use("/api/v1", v1Router);
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Express server running! Visit /api/users, /api/listings or /api/bookings' });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    uptime: process.uptime(), 
    timestamp: new Date() 
  });
});

setupSwagger(app);


app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

