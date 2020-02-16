const { executeSql } = require('../pg-client');

async function getTeamIdByLeagueAndTerm(league, term) {
  const statement = `
    SELECT team.id
    FROM team_search_term
    INNER JOIN team ON team.id = team_search_term.team_id
    WHERE team_search_term.term = '${term}' AND team.league = '${league}';`;

  const res = await executeSql(statement);
  if (res && res.rows && res.rows[0] && res.rows[0].id) {
    return res.rows[0].id;
  }

  const err = new Error('Not Found');
  return Promise.reject(err);
}

module.exports = {
  getTeamIdByLeagueAndTerm,
};
