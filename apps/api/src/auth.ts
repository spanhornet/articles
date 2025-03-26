// Drizzle ORM
import { db, schema } from "@repo/database";

// Better Auth
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
        ...schema,
        user: schema.users,
    },
    usePlural: true
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "users",
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  }
});