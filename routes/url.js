import handleRequest from '../helpers/handleRequest.js';
import handleResponse from '../helpers/handleResponse.js';

export default async (server, { hdbCore, logger }) => {
	server.route({
		url: '/url',
		method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
		handler: async (request, reply) => {
			const result = await handleRequest({
				hdbCore,
				request,
				reply,
				logger,
			});

			const response = { reply, ...result };

			return handleResponse(response);
		},
	});
};
