import express, { Express, Request, Response } from 'express';
import usersRouter from './routes/users.route.js';
import listingsRouter from './routes/listings.route.js';

const app: Express = express();
const port = 3000;

app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/listings', listingsRouter);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Express server running! Visit /api/users or /api/listings' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

