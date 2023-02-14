import https from 'https';
import http from 'http';
import { parse } from 'url';

const httpAgent = new http.Agent();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const callAPI = async ({ method, url, headers, body }) => {
	url = parse(url);
	return new Promise((resolve, reject) => {
		const callback = (response) => {
			let body = '';

			response.on('data', (chunk) => {
				body += chunk;
			});

			response.on('end', () => {
				body = JSON.parse(body);
				const { statusCode: status, headers } = response;
				resolve({ body, status, headers });
			});
		};

		const options = {
			host: url.host,
			port: url.protocol === 'https:' ? 443 : 80,
			protocol: url.protocol,
			path: url.path,
			method: method,
			agent: url.protocol === 'https:' ? httpsAgent : httpAgent,
			headers: headers,
		};
		delete options.headers.host;

		const req = (options.protocol === 'https:' ? https : http).request(options, callback);
		req.on('error', reject);
		if (body) {
			req.write(body);
		}
		req.end();
	});
};

export default callAPI;
