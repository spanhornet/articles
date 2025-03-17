import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { schema } from './schema';

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;
