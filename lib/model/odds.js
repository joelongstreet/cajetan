const { executeSql } = require('../pg-client');

async function insert({
  asOf, matchupId, teamAMoneyline, teamBMoneyline, teamAPoints, teamBPoints, overUnder,
}) {
  const exec = executeSql(
    `INSERT INTO odds (as_of, matchup_id, team_a_moneyline, team_b_moneyline, team_a_points, team_b_points, over_under)
    VALUES ('${asOf}', ${matchupId}, ${teamAMoneyline}, ${teamBMoneyline}, ${teamAPoints}, ${teamBPoints}, ${overUnder})
    RETURNING *;`,
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
