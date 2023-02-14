import config from './config.js';
const { schema, tableAttributes } = config.schema;

// ensure the schema, tables and attributes exist in the database
export const ensureSchema = async ({ hdbCore, logger }) => {
	// SCHEMA
	logger.notify(`Creating schema: ${schema}.`);
	try {
		await hdbCore.requestWithoutAuthentication({
			body: {
				operation: 'create_schema',
				schema,
			},
		});
		logger.notify(`Schema ${schema} created.`);
	} catch (error) {
		logger.notify(`Schema ${schema} already exists.`);
	}

	// TABLES and ATTRIBUTES
	for (let table of Object.keys(tableAttributes)) {
		logger.notify(`Creating table: ${table}.`);
		try {
			await hdbCore.requestWithoutAuthentication({
				body: {
					operation: 'create_table',
					schema,
					table,
					hash_attribute: 'id',
				},
			});
			// a pause to ensure tables sync
			await new Promise((resolve) => setTimeout(resolve, 1000));
			logger.notify(`Table ${table} created.`);
		} catch (error) {
			logger.notify(`Table ${table} already exists.`);
		}
		// ATTRIBUTES
		for (let attribute of tableAttributes[table]) {
			logger.notify(`Adding attribute: ${attribute} to table: ${table}.`);
			try {
				await hdbCore.requestWithoutAuthentication({
					body: {
						operation: 'create_attribute',
						schema,
						table,
						attribute,
					},
				});
				logger.notify(`Attribute: ${attribute} added to table: ${table}.`);
			} catch (error) {
				logger.notify(`Attribute: ${attribute} already exists on table: ${table}.`);
			}
		}
	}
};
