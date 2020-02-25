const { Client }        = require('pg');

const enableSqlLogging  = process.env.SQL_LOGGING;

const client = new Client({
  user:     'postgres',
  host:     'localhost',
  database: 'postgres',
  port:     54320,
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
