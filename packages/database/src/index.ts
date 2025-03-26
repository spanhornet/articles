// PostgreSQL
import postgres from 'postgres';

// Environment Variables
import * as dotenv from 'dotenv';

// Drizzle ORM
import { drizzle } from 'drizzle-orm/postgres-js';

import type { schema } from './schema';

dotenv.config();

if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error("SUPABASE_DATABASE_URL is not set in the environment variables");
}

const client = postgres(process.env.SUPABASE_DATABASE_URL, { prepare: false });

export const db = drizzle(client);
export * as schema from './schema';

export type User = typeof schema.users.$inferSelect;
export type UserInsert = typeof schema.users.$inferInsert;