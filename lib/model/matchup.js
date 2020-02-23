const { executeSql } = require('../pg-client');

async function insert({
  startTime, teamAId, teamBId, teamAScore, teamBScore,
  teamAIsHome, teamBIsHome, oddsLink, recapLink,
}) {
  const exec = await executeSql(
    `INSERT INTO matchup (start_time, team_a_id, team_b_id, team_a_score, team_b_score, team_a_is_home, team_b_is_home, odds_link, recap_link)
    VALUES ('${startTime}', ${teamAId}, ${teamBId}, ${teamAScore}, ${teamBScore}, ${teamAIsHome}, ${teamBIsHome}, '${oddsLink}', '${recapLink}')
    RETURNING *;`,
  );

  if (exec && exec.rows && exec.rows[0]) {
    return exec.rows[0];
  }

  const err = new Error(`Insert error ${startTime} | ${teamAId} | ${teamBId}`);
  return Promise.reject(err);
}

async function getById(id) {
  const res = await executeSql(`SELECT * FROM matchup where id = ${id};`);
  if (res && res.rows && res.rows[0]) {
    return res.rows[0];
  }

  const err = new Error(`Matchup not found: ${id}`);
  return Promise.reject(err);
}

async function getLeagueByMatchupId(matchupId) {
  const res = await executeSql(`SELECT team.league as league FROM matchup LEFT JOIN team on team.id = matchup.team_a_id where matchup.id = ${matchupId}`);
  if (res && res.rows && res.rows[0] && res.rows[0].league) {
    return res.rows[0].league;
  }

  const err = new Error(`League not found: ${matchupId}`);
  return Promise.reject(err);
}

module.exports = {
  insert,
  getById,
  getLeagueByMatchupId,
};
