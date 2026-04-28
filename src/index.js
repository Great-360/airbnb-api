import 'dotenv/config';
import express from 'express';
import usersRouter from './routes/users.route.js';
import listingsRouter from './routes/listings.route.js';
import bookingsRouter from './routes/bookings.route.js';
import authRouter from './routes/auth.route.js';
import { authentication } from './middlewares/auth.middleware.js';
import uploadRouter from './routes/upload.route.js';
import { setupSwagger } from './config/swagger.js';
const app = express();
const port = 3000;
app.use(express.json());
app.use("/auth", authRouter);
app.use('/users', authentication, usersRouter);
app.use('/listings', authentication, listingsRouter);
app.use('/bookings', authentication, bookingsRouter);
app.use("/users", uploadRouter);
app.get('/', (req, res) => {
    res.json({ message: 'Express server running! Visit /api/users, /api/listings or /api/bookings' });
});
setupSwagger(app);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map