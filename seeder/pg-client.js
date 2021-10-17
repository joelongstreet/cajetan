require('dotenv').config();

const { Client }        = require('pg');

const enableSqlLogging  = process.env.SQL_LOGGING;

const client = new Client({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port:     process.env.DB_PORT,
});

client.connect();

async function executeSql(statement) {
  if (enableSqlLogging) {
    console.debug(statement);
  }

  return client.query(statement)
    .catch((err) => {
      console.error('ERROR', err);
    });
}

module.exports = {
  executeSql,
};
