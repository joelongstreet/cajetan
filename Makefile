init:
	docker-compose up -d $(ARG)
	npm install
	docker exec -i cajetan psql -U postgres -e < migrate.sql
	docker exec -i cajetan psql -U postgres -e < seed.sql
	node lib/tasks/seed-matchups
	node lib/tasks/seed-matchups-times
	node lib/tasks/seed-odds

start:
	docker-compose up -d $(ARG)

stop:
	docker-compose down

reset:
	docker kill $$(docker ps -f name=cajetan -q)
	docker rm $$(docker ps -a -f name=cajetan -q)
	docker volume rm cajetan_cajetan
	make init
