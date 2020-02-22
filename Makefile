migrate:
	docker exec -i longshot psql -U postgres -e < migrate.sql

seed:
	docker exec -i longshot psql -U postgres -e < seed.sql

start:
	docker-compose up -d $(ARG)
	npm install

stop:
	docker-compose down

reset:
	docker kill $$(docker ps -f name=longshot -q)
	docker rm $$(docker ps -a -f name=longshot -q)
	docker volume rm longshot_longshot
