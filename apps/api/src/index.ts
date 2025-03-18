import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { errorHandler } from '@middleware/error-handler';
import { notFoundHandler } from '@middleware/not-found-handler';

import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";

// Import feature routers
import { userRouter } from './routes/user.route';

const app = express();
const PORT = process.env.PORT || 3000;

// Logger setup
const logger = pinoHttp({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

app.all("/api/auth/*", toNodeHandler(auth));

// Middleware
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: `http://localhost:/ ${process.env.PORT}`, // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
// app.use(helmet());


// Routes
app.use('/api/users', userRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${process.env.PORT}`);
});

export default app;

/*
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth"; //your better auth instance
 
app.get("/api/me", async (req, res) => {
 	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
	return res.json(session);
});
*/