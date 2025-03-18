import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import routes from "@routes/index";
import pino from "pino";

const app = express();

// Create a pino logger instance
const logger = pino({
  transport: process.env.NODE_ENV === 'production' ? undefined : {
    target: 'pino-pretty', // Pretty print for dev environment
    options: {
      colorize: true, // Optional: colorize the output for better visibility
    },
  },
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Use pino-http with the logger
app.use(pinoHttp({ logger }));

// Routes
app.use("/api", routes);

export default app;
