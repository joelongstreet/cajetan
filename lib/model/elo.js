const { executeSql } = require('../pg-client');

async function insert({ teamId, asOf, elo }) {
  console.log(`INSERT INTO elo (team_id, as_of, elo) VALUES (${teamId}, ${asOf}, ${elo});`);
  return executeSql(
    `INSERT INTO elo (team_id, as_of, elo) VALUES (${teamId}, '${asOf}', ${elo});`,
  );
}

module.exports = {
  insert,
};
