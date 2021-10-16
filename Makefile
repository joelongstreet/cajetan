include .env

init:
	docker-compose up -d $(ARG)
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
	docker kill $$(docker ps -f name=cajetan -q)
	docker rm $$(docker ps -a -f name=cajetan -q)
	docker volume rm cajetan_cajetan
	make init
