// PostgreSQL
import postgres from 'postgres';

// Environment Variables
import * as dotenv from 'dotenv';

// Drizzle ORM
import { drizzle } from 'drizzle-orm/postgres-js';

dotenv.config();

if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error("SUPABASE_DATABASE_URL is not set in the environment variables");
}

const connectionString = process.env.SUPABASE_DATABASE_URL;
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client);
export * as schema from './schema';