const { Model } = require('./model');

const Team = new Model({ tableName: 'team' });

async function getTeamIdByLeagueAndTerm(league, term) {
  const err = new Error(`Team not found: ${league} | ${term}`);
  const sql = `SELECT team.id
              FROM team_search_term
              INNER JOIN team ON team.id = team_search_term.team_id
              WHERE team_search_term.term = '${term}' AND team.league = '${league}';`;

  const res = await Team.executeSql(sql, err);
  return res[0].id;
}

async function getTeamIdsByLeagueAndTerms(league, terms) {
  const err           = new Error(`Team not found: ${league} | ${terms}`);
  const stringedTerms = terms.map((t) => `'${t}'`);
  const termList      = stringedTerms.join(', ');
  const sql           = `SELECT team.id, team_search_term.term
                        FROM team_search_term
                        INNER JOIN team ON team.id = team_search_term.team_id
                        WHERE team_search_term.term IN(${termList}) AND team.league = '${league}';`;

  const res = await Team.executeSql(sql, err);
  return res;
}

module.exports = {
  getTeamIdByLeagueAndTerm,
  getTeamIdsByLeagueAndTerms,
};
