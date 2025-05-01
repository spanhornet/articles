// Environment Variables
import dotenv from "dotenv";

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';

// Better-Auth
import { auth } from './auth';
import { toNodeHandler } from "better-auth/node";

// Routes
import { userRouter } from './routes/users.route';
import { courseRouter } from './routes/course.route';
import { artworkRouter } from './routes/artwork.route';
import { imageRouter } from './routes/image.route';
import { enrollmentRouter } from './routes/enrollment.route';
import { artworkProgressRouter } from './routes/artworkProgress.route';
dotenv.config();

const app = express();

if (!process.env.PORT) {
  throw new Error("PORT is not set in the environment variables");
}

const PORT = process.env.PORT;

// Pino Logger
const logger = pinoHttp({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      messageFormat: '{msg}',
      ignore: 'pid,hostname',
      translateTime: 'HH:MM:ss',
      minimumLevel: 'info'
    }
  }
});

// Better-Auth Handler
// This must come before express.json() middleware
app.all("/api/auth/*", toNodeHandler(auth));

// Middleware
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    // Allow request from your Next.js frontend
    origin: "http://localhost:3000",

    // Specify allowed methods
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Allow these headers to be sent
    allowedHeaders: ['Content-Type', 'Authorization'],

    // Expose these headers to the browser
    exposedHeaders: ['Set-Cookie'],

    // Pre-flight requests will be cached for 1 hour
    maxAge: 3600
  })
);

// Helmet is currently disabled to avoid issues during development
// Uncomment in production for additional security headers
// app.use(helmet());

// Routers
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/artwork', artworkRouter);
app.use('/api/image', imageRouter);
app.use('/api/enrollment', enrollmentRouter);
app.use('/api/progress', artworkProgressRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;