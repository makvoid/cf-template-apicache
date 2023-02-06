cf=api-cache

default: dev
cfr: cf_restart

dev: down
	docker run \
		-v $(shell pwd):/home/harperdb/hdb/custom_functions/$(cf) \
		-e LOG_LEVEL=info \
		-e HDB_ADMIN_USERNAME=hdbcf \
		-e HDB_ADMIN_PASSWORD=hdbcf \
		-e LOGGING_STDSTREAMS=true \
		-e OPERATIONSAPI_FOREGROUND=true \
		-e OPERATIONSAPI_PORT=9925 \
		-e CUSTOMFUNCTIONS_ENABLED=true \
		-e CUSTOMFUNCTIONS_PORT=9926 \
		-p 9925:9925 \
		-p 9926:9926 \
		harperdb/harperdb:latest

bash:
	docker run \
		-it \
		-v $(shell pwd):/opt/harperdb/hdb/custom_functions/$(cf) \
		harperdb/harperdb:latest \
		bash

cf_restart:
	curl http://localhost:9925 \
		-X POST \
		-H "Content-Type: application/json" \
		-H "Authorization: Basic aGRiY2Y6aGRiY2Y=" \
		-d '{"operation": "restart_service", "service": "custom_functions"}'

down:
	docker stop $(shell docker ps -q --filter ancestor=harperdb/harperdb ) || exit 0
