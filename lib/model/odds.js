const { executeSql } = require('../pg-client');

async function insert({
  asOf, matchupId, teamAMoneyline, teamBMoneyline, teamAPoints, teamBPoints, overUnder,
}) {
  return executeSql(
    `INSERT INTO odds (as_of, matchup_id, team_a_moneyline, team_b_moneyline, team_a_points, team_b_points, over_under)
    VALUES ('${asOf}', ${matchupId}, ${teamAMoneyline}, ${teamBMoneyline}, ${teamAPoints}, ${teamBPoints}, ${overUnder});`,
  );
}

module.exports = {
  insert,
};
