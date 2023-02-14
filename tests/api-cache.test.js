import { assert } from 'chai';
import axios from 'axios';

const url = 'http://localhost:9925';
const schema = 'api_cache';
const table = 'request_cache';
const username = 'hdbcf';
const password = 'hdbcf';
const token = Buffer.from(`${username}:${password}`).toString('base64');
const authorization = `Basic ${token}`;
const headers = { authorization };
describe('schema creation', function () {
	this.timeout(25000);
	before(async () => {
		console.log('ensuring schema does not exist');
		try {
			await operation({ operation: 'drop_schema', schema });
			console.log('schema dropped');
		} catch (error) {
			console.log('schema already dropped');
		}
	});

	it('creates schema upon CF restart', async () => {
		// restart CF, which should create the schema
		await operation({
			operation: 'restart_service',
			service: 'custom_functions',
		});

		await new Promise((r) => setTimeout(r, 5000));

		const response = await operation({
			operation: 'describe_table',
			schema,
			table,
		});

		assert.equal(response.data.name, table);
	});
});

function operation(data) {
	return axios({
		url,
		method: 'POST',
		data,
		headers,
	});
}
