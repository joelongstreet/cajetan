const { Model } = require('./model');

const Matchup   = new Model({ tableName: 'matchup' });

async function getById(id) {
  const sql = `SELECT * FROM matchup where id = ${id};`;
  const err = new Error(`Mathcup not found: ${id}`);
  const res = await Matchup.executeSql(sql, err);
  return res[0];
}

async function insert({
  teamAId, teamBId, teamAScore, teamBScore,
  teamAIsHome, teamBIsHome, oddsLink, fetchedFrom,
}) {
  const err = new Error(`Insert error ${teamAId} | ${teamBId}`);
  const sql = `INSERT INTO matchup (team_a_id, team_b_id, team_a_score, team_b_score, team_a_is_home, team_b_is_home, odds_link, fetched_from)
              VALUES (${teamAId}, ${teamBId}, ${teamAScore}, ${teamBScore}, ${teamAIsHome}, ${teamBIsHome}, '${oddsLink}', '${fetchedFrom}')
              RETURNING *;`;

  const res = await Matchup.executeSql(sql, err);
  return res[0];
}

async function getLeagueByMatchupId(matchupId) {
  const err = new Error(`League not found: ${matchupId}`);
  const sql = `SELECT team.league as league FROM matchup LEFT JOIN team on team.id = matchup.team_a_id where matchup.id = ${matchupId};`;

  const rows = await Matchup.executeSql(sql, err);
  return rows[0].league;
}

async function getMatchupsWithoutOddsRows(limit = 100) {
  const err = new Error('No outstanding odds rows');
  const sql = `SELECT matchup.odds_link, matchup.id
              FROM matchup
              LEFT JOIN odds ON odds.matchup_id = matchup.id
              WHERE odds.matchup_id is NULL AND matchup.odds_link IS NOT NULL
              ORDER BY RANDOM()
              LIMIT ${limit};`;

  const res = await Matchup.executeSql(sql, err);
  return res;
}

module.exports = {
  insert,
  getById,
  getLeagueByMatchupId,
  getMatchupsWithoutOddsRows,
};
