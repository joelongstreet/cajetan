include .env

init:
	docker-compose up -d $(ARG)

seed:
	cd seeder && npm install
	node seeder/lib/tasks/seed-matchups
	node seeder/lib/tasks/seed-matchups-times
	node seeder/lib/tasks/seed-elo
	node seeder/lib/tasks/seed-odds

start:
	docker-compose up -d $(ARG)

stop:
	docker-compose down

reset:
	docker kill $$(docker ps -f name=cajetan -q) || true
	docker rm $$(docker ps -a -f name=cajetan -q) || true
	docker volume rm cajetan_cajetan || true
	make init

upload-local-to-remote:
	pg_dump --host ${DB_HOST} --port ${DB_PORT} --username ${DB_USER} --dbname ${DB_DATABASE} --file ./backing-apps/dump.sql --no-owner --no-privileges --clean --verbose --if-exists
	PGPASSWORD=${REMOTE_DB_PASSWORD} psql --host ${REMOTE_DB_HOST} --port ${REMOTE_DB_PORT} --username ${REMOTE_DB_USER} --command 'DROP DATABASE IF EXISTS ${REMOTE_DB_DATABASE};'
	PGPASSWORD=${REMOTE_DB_PASSWORD} psql --host ${REMOTE_DB_HOST} --port ${REMOTE_DB_PORT} --username ${REMOTE_DB_USER} --command 'CREATE DATABASE ${REMOTE_DB_DATABASE};'
	PGPASSWORD=${REMOTE_DB_PASSWORD} psql --host ${REMOTE_DB_HOST} --port ${REMOTE_DB_PORT} --username ${REMOTE_DB_USER} --dbname ${REMOTE_DB_DATABASE} --file ./backing-apps/dump.sql
