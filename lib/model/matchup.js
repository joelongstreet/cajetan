const { executeSql } = require('../pg-client');

async function insert({
  startTime, teamAId, teamBId, teamAScore, teamBScore, teamAIsHome, teamBIsHome, recapLink,
}) {
  return executeSql(
    `INSERT INTO matchup (start_time, team_a_id, team_b_id, team_a_score, team_b_score, team_a_is_home, team_b_is_home, recap_link)
    VALUES ('${startTime}', ${teamAId}, ${teamBId}, ${teamAScore}, ${teamBScore}, ${teamAIsHome}, ${teamBIsHome}, '${recapLink}');`,
  );
}

module.exports = {
  insert,
};
