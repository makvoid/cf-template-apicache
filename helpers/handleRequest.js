import config from './config.js';
import { md5 } from './utils.js';
import { getRecord, saveRecord, updatingRecord } from './cacheHelper.js';
import { callAPI } from './callAPI.js';

export const getResults = async ({ hdbCore, logger, method, url, headers, body, shouldCache = true }) => {
	// 1. parse url into an md5 id
	// 2. check for shouldSkipCache
	//		a. call API
	//		b. return results
	// 3. check for existing record
	//		a. return 304 if exists and updatedtime < headers[if-modified-since]
	// 4. check if record is updating
	//		a. wait for update to complete
	// 5. check if record is out of date (consult headers[access-control-max-age])
	//		a. set record to updating
	//		b. call API for new data
	//		c. save new record
	//		d. get record
	// 6. return the cached record

	// 1. CREATE ID from the method, url, and any headers (specified in the config)
	let id = `${method}${url}`;
	for (let header in config.HEADERS_TO_CACHE) {
		if (header in headers) {
			id += `:${header}=${headers[header]}`;
		}
	}
	id = md5(id); // because a string with a forward slash cannot be a record id

	// 2. SKIP CACHE
	if (!config.METHODS_TO_CACHE.includes(method)) {
		shouldCache = false;
	}

	// if not caching, get and return the data
	if (!shouldCache) {
		const { body: replyBody, status, headers: apiHeaders } = await callAPI({ request, url, headers });
		const replyHeaders = Object.assign({}, apiHeaders, { 'hdb-from-cache': false });
		return { status, replyBody, replyHeaders };
	}

	// 3. GET RECORD
	let cachedRecord = await getRecord({ hdbCore, id });
	if (cachedRecord && headers['if-modified-since']) {
		const ifModifiedSince = new Date(headers['if-modified-since']);
		const updatedTime = new Date(cachedRecord.__updatedtime__);
		if (updatedTime <= ifModifiedSince) {
			return { status: 304, replyBody: null, replyHeaders: {} };
		}
	}

	// 4. CHECK for existing record in an updating state
	if (cachedRecord && cachedRecord.updating) {
		// wait while record is updating
		let bit = 0;
		while (cachedRecord.updating) {
			await new Promise((r) => setTimeout(r, 1 << bit));
			cachedRecord = await getRecord({ hdbCore, id });
			bit++;
			if (bit > 10) {
				throw new Error('Record update timeout');
			}
		}
	}

	const maxAge = parseInt(headers['access-control-max-age'] || config.MAX_AGE_SECONDS) * 1000;
	const minTimestamp = Date.now() - maxAge;
	const needsToUpdate =
		!cachedRecord ||
		cachedRecord.__updatedtime__ < minTimestamp ||
		!cachedRecord.status ||
		cachedRecord.status < 200 ||
		cachedRecord.status > 299;

	// 5. UPDATE RECORD (or create if doesn't already exist)
	if (needsToUpdate) {
		if (cachedRecord) {
			await updatingRecord({ hdbCore, logger, id });
		}
		const { body: replyBody, status, headers: apiHeaders } = await callAPI({ method, url, headers, body });
		await saveRecord({ hdbCore, logger, id, url, body: replyBody, status, headers: apiHeaders });
		cachedRecord = await getRecord({ hdbCore, id });
	}

	// 6. RETURN cached record
	const { body: replyBody, status, headers: apiHeaders } = cachedRecord;
	const replyHeaders = Object.assign({}, apiHeaders, {
		'hdb-from-cache': true,
		'last-modified': new Date(cachedRecord.__updatedtime__).toUTCString(),
	});
	return { status, replyBody, replyHeaders };
};
