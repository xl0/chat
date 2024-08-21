// import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const hiddenItems = pgTable('hidden_items', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.references(() => usersTable.id, { onDelete: 'cascade' })
		.notNull(),
	itemID: uuid('item_id').notNull(), // This can reference assistants/models/providers/apikeys.
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

// export const userHiddenItemsRelations = relations(hiddenItems, ({ one }) => ({
// 	user: one(usersTable, {
// 		fields: [hiddenItems.userId],
// 		references: [usersTable.id]
// 	}),
// }));
