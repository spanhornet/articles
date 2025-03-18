// Environment Variables
import dotenv from "dotenv";

// Drizzle ORM
import { db, schema } from "@repo/database";

// Bette Auth
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

dotenv.config();
 
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
        enabled: true
    }, 
    user: {
        additionalFields: { 
            phone: {
               type: "string",
               required: false,
               defaultValue: "",
            },
            role: {
                type: "string",
                required: false,
                defaultValue: "STUDENT",
             },
        }
     },
});