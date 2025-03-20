// Environment Variables
import dotenv from "dotenv";

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';

// Better-Auth
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

import { userRouter } from './routes/user.route';
import { courseRouter } from "./routes/course.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Pino Logger
const logger = pinoHttp({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
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
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;