import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppError, globalErrorHandler }  from './utils/errorHandler.js';
import authRoutes from './routes/authRoutes.js'; // Use .js extension
import cycleRoutes from './routes/cycleRoutes.js'; // Use .js extension
import reservationRoutes from './routes/reservationRoutes.js'; // Use .js extension

dotenv.config();
const app = express();
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', // Specify the client's origin
    credentials: true,               // Allow cookies
};

app.use(cors(corsOptions));
app.use(express.json()); // Add this if you haven't already

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/cycles', cycleRoutes)
app.use('/api/v1/reservations', reservationRoutes)

// 404 handler
app.all('*', (req, res, next) => {
    next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global error handler should be last
app.use(globalErrorHandler);

// Start the reservation scheduler
import './workers/reservationWorker.js';

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});