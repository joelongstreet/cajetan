#!/bin/bash

set -o allexport
source /.env
set +o allexport

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --command "CREATE DATABASE ${DB_DATABASE};"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_DATABASE" --file /migrate.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_DATABASE" --file /seed.sql
