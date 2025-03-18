// Environment Variables
import { config } from 'dotenv';

// Drizzle ORM
import { db, schema } from "@repo/database";

// Better Auth
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

config({ path: '.env' });

/*
    socialProviders: { 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID!, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!, 
        }, 
    }
*/
 
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