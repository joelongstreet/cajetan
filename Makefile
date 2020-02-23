init:
	docker-compose up -d $(ARG)
	npm install
	docker exec -i longshot psql -U postgres -e < migrate.sql
	docker exec -i longshot psql -U postgres -e < seed.sql

start:
	docker-compose up -d $(ARG)

stop:
	docker-compose down

reset:
	docker kill $$(docker ps -f name=longshot -q)
	docker rm $$(docker ps -a -f name=longshot -q)
	docker volume rm longshot_longshot
	make init
