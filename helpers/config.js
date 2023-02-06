const schema = 'api_cache';
const cacheTable = 'request_cache';

export default {
	MAX_AGE_SECONDS: 300,
	METHODS_TO_CACHE: ['GET'],
	HEADERS_TO_CACHE: [],
	schema: {
		schema,
		tableAttributes: { [cacheTable]: ['updating'] },
		cacheTable,
	},
};
