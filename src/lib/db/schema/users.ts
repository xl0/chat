import { relations } from 'drizzle-orm';
import { boolean, pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { providersTable } from './providers';
import { assistantsTable } from './assistants';
import { conversationsTable } from './conversations';
import { mediaTable } from './media';

const authSchema = pgSchema('auth');
export const AuthUsersTable = authSchema.table('users', {
	id: uuid('id').primaryKey()
});

export const defaultsUUID = '00000000-0000-0000-0000-000000000000';

export const usersTable = pgTable('users', {
	id: uuid('id')
		.references(() => AuthUsersTable.id, { onDelete: 'cascade' })
		.primaryKey(),
	name: text('name'),
	email: text('email'),
	admin: boolean('admin').default(false),
	hacker: boolean('hacker').default(false),
	assistant: text('assistant'),
	aboutUser: text('about_user'),
	assistantInstructions: text('assistant_instructions'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const userTableRelations = relations(usersTable, ({ many }) => ({
	providers: many(providersTable),
	assistants: many(assistantsTable),
	conversations: many(conversationsTable),
	media: many(mediaTable)
}));
