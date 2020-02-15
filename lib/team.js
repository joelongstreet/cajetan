const { executeSql } = require('./pg-client');

const teamMaps = {
  NFL: {
    '49ers'       : ['SFO'],
    Bears         : ['CHI'],
    Bengals       : ['CIN'],
    Bills         : ['BUF'],
    Broncos       : ['DEN'],
    Browns        : ['CLE'],
    Buccaneers    : ['TAM'],
    Cardinals     : ['ARI'],
    Chargers      : ['LAC'],
    Chiefs        : ['KAN'],
    Colts         : ['IND'],
    Cowboys       : ['DAL'],
    Dolphins      : ['MIA'],
    Eagles        : ['PHI'],
    Falcons       : ['ATL'],
    Giants        : ['NYG'],
    Jaguars       : ['JAC'],
    Jets          : ['NYJ'],
    Lions         : ['DET'],
    Packers       : ['GNB'],
    Panthers      : ['CAR'],
    Patriots      : ['NWE'],
    Raiders       : ['OAK'],
    Rams          : ['LAR'],
    Ravens        : ['BAL'],
    Redskins      : ['WAS'],
    Saints        : ['NOR'],
    Seahawks      : ['SEA'],
    Steelers      : ['PIT'],
    Texans        : ['HOU'],
    Titans        : ['TEN'],
    Vikings       : ['MIN'],
  },
};

async function getTeamIdByLeagueAndTerm(league, term) {
  const teams = teamMaps[league];
  const monikers = Object.keys(teams);
  const moniker = monikers.filter((m) => teams[m].includes(term));

  const res = await executeSql(`SELECT id FROM team WHERE moniker = '${moniker}' LIMIT 1;`);
  if (res && res.rows && res.rows[0] && res.rows[0].id) {
    console.log(res.rows[0].id);
    return res.rows[0].id;
  }

  const err = new Error('Not Found');
  return Promise.reject(err);
}

module.exports = {
  getTeamIdByLeagueAndTerm,
};
