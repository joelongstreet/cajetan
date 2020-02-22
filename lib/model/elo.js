const { executeSql } = require('../pg-client');

async function insert({ teamId, asOf, elo }) {
  const exec = await executeSql(
    `INSERT INTO elo (team_id, as_of, elo) VALUES (${teamId}, '${asOf}', ${elo}) RETURNING *;`,
  );

  if (exec.rows && exec.rows[0]) {
    return exec.rows[0];
  }

  const err = new Error('Insert error');
  return Promise.reject(err);
}

module.exports = {
  insert,
};
