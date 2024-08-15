import { DBgetMessage } from '$lib/db/utils';
import { json } from '@sveltejs/kit';
import dbg from 'debug';
import type { RequestHandler } from './$types';
const debug = dbg('app:api:message:id');

export const GET: RequestHandler = async ({ locals: { dbUser }, params: { id } }) => {
	debug('GET <- %o', id);
	const message = await DBgetMessage({ dbUser, id });
	debug('GET %o -> %o', id, message);
	return json(message);
};