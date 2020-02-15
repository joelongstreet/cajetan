MIGRATION_FILE=migrate.sql
MIGRATION_TASKS=`cat $(MIGRATION_FILE)`

migrate:
	docker exec -i longshot psql -U postgres -e < migrate.sql

start:
	docker-compose up -d $(ARG)
	npm install

stop:
	docker-compose down

