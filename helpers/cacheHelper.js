import config from './config.js';
const { schema, cacheTable: table } = config.schema;

// retrive a cache record from the database
export const getRecord = async ({ hdbCore, id }) => {
	try {
		const results = await hdbCore.requestWithoutAuthentication({
			body: {
				operation: 'search_by_hash',
				schema,
				table,
				hash_values: [id],
				get_attributes: ['*'],
				hdb_user: {
					role: { permission: { super_user: true } },
					username: 'hdbadmin',
				},
			},
		});

		if (!results.length) {
			return false;
		}

		return results[0];
	} catch (error) {
		return false;
	}
};

// update a cache record so that updating=true
export const updatingRecord = ({ hdbCore, id }) => {
	return hdbCore.requestWithoutAuthentication({
		body: {
			operation: 'update',
			schema,
			table,
			records: [{ id, updating: true }],
			hdb_user: {
				role: { permission: { super_user: true } },
				username: 'hdbadmin',
			},
		},
	});
};

// upsert a cache record
export const saveRecord = async ({ hdbCore, id, url, status, headers, body }) => {
	return hdbCore.requestWithoutAuthentication({
		body: {
			operation: 'upsert',
			schema,
			table,
			records: [
				{
					id,
					url,
					status,
					headers,
					body,
					updating: false,
				},
			],
			hdb_user: {
				role: { permission: { super_user: true } },
				username: 'hdbadmin',
			},
		},
	});
};
