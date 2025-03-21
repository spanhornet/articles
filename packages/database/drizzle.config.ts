// Drizzle ORM
import type { Config } from 'drizzle-kit';

// Environment Variables
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/schema.ts',
  out: './src/drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.SUPABASE_DATABASE_URL || '',
  },
} satisfies Config;