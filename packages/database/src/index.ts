// PostgreSQL
import postgres from 'postgres';

// Environment Variables
import * as dotenv from 'dotenv';

// Drizzle ORM
import { drizzle } from 'drizzle-orm/postgres-js';

import type { schema } from './schema';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client);
export * as schema from './schema';

// User Types
export type User = typeof schema.users.$inferSelect;
export type UserInsert = typeof schema.users.$inferInsert;

// Course Types
export type Course = typeof schema.courses.$inferSelect;
export type CourseInsert = typeof schema.courses.$inferInsert;

// Artwork Types
export type Artwork = typeof schema.artworks.$inferSelect;
export type ArtworkInsert = typeof schema.artworks.$inferInsert;