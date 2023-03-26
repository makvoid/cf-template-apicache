'use strict';

import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export default async (server, { hdbCore, logger }) => {
  server.route({
    url: '/sure-route-test-object',
    method: 'GET',
    handler: async (request, reply) => {
      const template = await fs.readFile(
        resolve(__dirname, '../static/sure-route-test-object.html'),
        'utf-8'
      )
      reply
        .code(200)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(template)
	  }
  });
};
