import dbg from 'debug';

const debug = dbg('app:lib:api:message');

export async function APIfetchMessage(id: string, withDeleted = false) {
	debug('fetchMessage %o', { id, withDeleted });
	const queryParams = new URLSearchParams();
	if (withDeleted) queryParams.append('deleted', 'true');

	const res = await fetch(`/api/message/${id}?${queryParams}`);

	if (!res.ok) throw new Error(`Failed to fetch message: ${await res.text()}`);
	const data = await res.json();
	if (!data.id) throw new Error('The message ID is missing in returned data.');
	debug('fetchMessage -> %o', data);
	return data as MessageInterface;
}

export async function APIupsertMessage(message: MessageInterface) {
	debug('upsertMessage %o', message);
	const res = await fetch('/api/message', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(message)
	});

	if (!res.ok) throw new Error(`Failed to update message: ${await res.text()}`);
	const data = (await res.json()) as MessageInterface;
	debug('upsertMessage -> %o', data);
	return data;
}

export async function APIdeleteMessage(message: MessageInterface) {
	debug('deleteMessage %o', message);
	const res = await fetch('/api/message', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(message)
	});

	if (!res.ok) throw new Error(`Failed to delete message: ${await res.text()}`);
	const data = (await res.json()) as MessageInterface;
	debug('deleteMessage -> %o', data);
	return data;
}
