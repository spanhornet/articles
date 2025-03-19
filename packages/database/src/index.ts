// PostgreSQL
import postgres from 'postgres';

// Environment Variables
import * as dotenv from 'dotenv';

// Drizzle ORM
import { drizzle } from 'drizzle-orm/postgres-js';

// Database Schema
import { schema } from './schema';

dotenv.config();

const connectionString = process.env.SUPABASE_DATABASE_URL || "";
export const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client);

export * as schema from './schema';
export * from './types';