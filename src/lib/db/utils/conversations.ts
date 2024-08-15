import { undefineExtras } from '$lib/utils';
import { error } from '@sveltejs/kit';
import { and, eq, not } from 'drizzle-orm';
import { db } from '../index';
import { conversationsTable, defaultsUUID } from '../schema';

export async function DBgetDefaultConversations() {
	const conversations = await db.query.conversationsTable.findMany({
		where: (table, { eq, and, not }) => and(eq(table.userID, defaultsUUID), not(eq(table.deleted, true))),
		orderBy: (table, { desc }) => [desc(table.order)]
	});

	if (!conversations) error(500, 'Failed to fetch default conversations');

	return conversations;
}

export async function DBgetDefaultConversation({ id }: { id: string }) {
	const conversation = await db.query.conversationsTable.findFirst({
		where: (table, { eq, and }) => and(eq(table.id, id), eq(table.userID, defaultsUUID)),
		with: {
			messages: {
				where: (table, { eq, not }) => not(eq(table.deleted, true)),
				orderBy: (table, { asc }) => [asc(table.order)]
			}
		}
	});

	if (!conversation) error(404, 'Conversation not found or does not belong to the user');

	return conversation;
}

export async function DBgetConversations({ dbUser }: { dbUser?: UserInterface }) {
	if (!dbUser) error(401, 'Unauthorized');
	const conversations = await db.query.conversationsTable.findMany({
		where: (table, { eq }) => and(eq(table.userID, dbUser.id), not(eq(table.deleted, true))),
		orderBy: (table, { desc }) => [desc(table.order)]
	});

	if (!conversations) error(500, 'Failed to fetch conversations');

	return conversations;
}

export async function DBgetConversation({ dbUser, id }: { dbUser?: UserInterface; id: string }) {
	if (!dbUser) error(401, 'Unauthorized');
	const conversation = await db.query.conversationsTable.findFirst({
		where: (table, { eq, and }) => and(eq(table.id, id), eq(table.userID, dbUser.id)),
		with: {
			messages: {
				where: (table, { eq, not }) => not(eq(table.deleted, true)),
				orderBy: (table, { asc }) => [asc(table.order)]
			}
		}
	});

	if (!conversation) error(404, 'Conversation not found or does not belong to the user');

	return conversation;
}

export async function DBupsertConversation({
	dbUser,
	conversation
}: {
	dbUser?: UserInterface;
	conversation: ConversationInterface;
}) {
	if (!dbUser) error(401, 'Unauthorized');
	if (conversation.userID != dbUser.id && (!dbUser.admin || conversation.userID !== defaultsUUID))
		error(401, 'Tried to update a conversation that does not belong to the user');

	conversation = undefineExtras(conversation);

	if (conversation.id) {
		const update = await db
			.update(conversationsTable)
			.set(conversation)
			.where(and(eq(conversationsTable.id, conversation.id), eq(conversationsTable.userID, conversation.userID)))
			.returning();

		if (!update.length) {
			error(403, 'Tried to update a conversation that does not exist or does not belong to the user');
		}

		return update[0];
	}

	const insert = await db.insert(conversationsTable).values(conversation).onConflictDoNothing().returning();

	if (!insert || !insert.length) error(500, 'Failed to update conversation');

	return insert[0];
}

export async function DBdeleteConversation({
	dbUser,
	conversation
}: {
	dbUser?: UserInterface;
	conversation: ConversationInterface;
}) {
	if (!dbUser) error(401, 'Unauthorized');
	if (!conversation.id) error(400, 'Conversation ID is required');
	if (conversation.userID != dbUser.id && (!dbUser.admin || conversation.userID !== defaultsUUID))
		error(401, 'Tried to delete a conversation that does not belong to the user');

	const res = await db
		.delete(conversationsTable)
		.where(and(eq(conversationsTable.id, conversation.id), eq(conversationsTable.userID, conversation.userID)))
		.returning({ id: conversationsTable.id });

	if (!res.length) error(500, 'Failed to delete conversation');

	return res[0];
}
