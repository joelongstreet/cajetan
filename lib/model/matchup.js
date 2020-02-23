const { Model } = require('./model');

const Matchup     = new Model({ tableName: 'matchup' });

async function getById(id) {
  const sql = `SELECT * FROM matchup where id = ${id};`;
  const err = new Error(`Mathcup not found: ${id}`);
  const res = await Matchup.executeSql(sql, err);
  return res;
}

async function insert({
  startTime, teamAId, teamBId, teamAScore, teamBScore,
  teamAIsHome, teamBIsHome, oddsLink, recapLink,
}) {
  const err = new Error(`Insert error ${startTime} | ${teamAId} | ${teamBId}`);
  const sql = `INSERT INTO matchup (start_time, team_a_id, team_b_id, team_a_score, team_b_score, team_a_is_home, team_b_is_home, odds_link, recap_link)
              VALUES ('${startTime}', ${teamAId}, ${teamBId}, ${teamAScore}, ${teamBScore}, ${teamAIsHome}, ${teamBIsHome}, '${oddsLink}', '${recapLink}')
              RETURNING *;`;

  const res = await Matchup.executeSql(sql, err);
  return res;
}

async function getLeagueByMatchupId(matchupId) {
  const err = new Error(`League not found: ${matchupId}`);
  const sql = `SELECT team.league as league FROM matchup LEFT JOIN team on team.id = matchup.team_a_id where matchup.id = ${matchupId};`;

  const res = await Matchup.executeSql(sql, err);
  return res.league;
}

module.exports = {
  insert,
  getById,
  getLeagueByMatchupId,
};
