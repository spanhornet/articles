// Environment Variables
import * as dotenv from 'dotenv';

// Drizzle ORM
import { defineConfig } from 'drizzle-kit';

dotenv.config();

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment variables");
}

export default defineConfig({
  out: "./src/drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});