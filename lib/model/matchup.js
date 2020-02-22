const { executeSql } = require('../pg-client');

async function insert({
  startTime, teamAId, teamBId, teamAScore, teamBScore, teamAIsHome, teamBIsHome, recapLink,
}) {
  const exec = await executeSql(
    `INSERT INTO matchup (start_time, team_a_id, team_b_id, team_a_score, team_b_score, team_a_is_home, team_b_is_home, recap_link)
    VALUES ('${startTime}', ${teamAId}, ${teamBId}, ${teamAScore}, ${teamBScore}, ${teamAIsHome}, ${teamBIsHome}, '${recapLink}')
    RETURNING *;`,
  );

  if (exec.rows && exec.rows[0]) {
    return exec.rows[0];
  }

  const err = new Error('Insert error');
  return Promise.reject(err);
}

async function getById(id) {
  return executeSql(`SELECT * FROM matchup where id = ${id}`);
}

async function getLeagueByMatchupId(id) {
  return executeSql(`SELECT * FROM matchup where id = ${id}`);
}

module.exports = {
  insert,
  getById,
  getLeagueByMatchupId,
};
