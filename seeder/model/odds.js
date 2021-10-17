const { Model } = require('./model');

const Odds = new Model({ tableName: 'odds' });

async function insert({
  asOf, matchupId, teamAMoneyline, teamBMoneyline, teamAPoints, teamBPoints, overUnder,
}) {
  const err = new Error(`Could not insert ${Odds.tableName}: ${asOf} | ${matchupId}`);
  const sql = `INSERT INTO odds (as_of, matchup_id, team_a_moneyline, team_b_moneyline, team_a_points, team_b_points, over_under)
              VALUES ('${asOf}', ${matchupId}, ${teamAMoneyline}, ${teamBMoneyline}, ${teamAPoints}, ${teamBPoints}, ${overUnder})
              RETURNING *;`;

  const res = await Odds.executeSql(sql, err);
  return res[0];
}

module.exports = {
  insert,
};
