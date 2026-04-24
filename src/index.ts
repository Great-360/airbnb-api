import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import usersRouter from './routes/users.route.js';
import listingsRouter from './routes/listings.route.js';
import bookingsRouter from './routes/bookings.route.js';
import authRouter from './routes/auth.route.js';
import { authentication } from './middlewares/auth.middleware.js';


const app: Express = express();
const port = 3000;

app.use(express.json());

app.use("/auth", authRouter)

app.use('/users', authentication,usersRouter);
app.use('/listings', listingsRouter);
app.use('/bookings', bookingsRouter);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Express server running! Visit /api/users, /api/listings or /api/bookings' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

