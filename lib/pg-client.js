const { Client } = require('pg');

const connected = false;
const client = new Client({
  user:     'postgres',
  host:     'localhost',
  database: 'postgres',
  port:     54320,
});

async function executeSql(statement) {
  if (!connected) {
    await client.connect();
  }

  return client.query(statement)
    .catch((err) => {
      console.error('ERROR', err);
      process.exit();
    });
}

module.exports = {
  executeSql,
};
