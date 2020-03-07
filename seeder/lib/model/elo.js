const { Model } = require('./model');

const Elo = new Model({ tableName: 'elo' });

async function insert({ teamId, asOf, elo }) {
  const err = new Error(`Could not insert ${Elo.tableName}: ${teamId} | ${asOf} | ${elo}`);
  const sql = `INSERT INTO elo (team_id, as_of, elo) VALUES (${teamId}, '${asOf}', ${elo}) RETURNING *;`;
  const res = await Elo.executeSql(sql, err);
  return res[0];
}

module.exports = {
  insert,
};
