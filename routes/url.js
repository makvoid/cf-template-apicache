import config from '../helpers/config.js';
import { getResults } from '../helpers/handleRequest.js';
import { ensureSchema } from '../helpers/schemaHelper.js';

export default async (server, { hdbCore, logger }) => {
	await ensureSchema({ hdbCore, logger });
	server.route({
		url: '/',
		method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
		handler: async (request, reply) => {
			const url = request.url.substr(request.url.indexOf('?')).replace('?', '');
			const { headers, method, body } = request;

			try {
				const { status, replyBody, replyHeaders } = await getResults({
					hdbCore,
					logger,
					method,
					url,
					headers,
					body,
				});
				for (const header in replyHeaders) {
					reply.header(header, replyHeaders[header]);
				}
				return reply.code(status).send(replyBody);
			} catch (error) {
				reply.header('content-type', 'application/json; charset=utf-8');
				return reply.code(500).send({ error: error.message });
			}
		},
	});
};
