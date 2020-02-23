const cheerio                         = require('cheerio');

const { insert: insertOdds }          = require('../model/odds');
const { getTeamIdByLeagueAndTerm }    = require('../model/team');
const { getById: getMatchupById }     = require('../model/matchup');
const { getLeagueByMatchupId }        = require('../model/matchup');
const { getMatchupsWithoutOddsRows }  = require('../model/matchup');
const { fetchHtml }                   = require('../util');
const { parseToFloatOrNull }          = require('../util');
const { makeDateFromParts }           = require('../util');

const startTime                       = new Date().getTime();
const oddsSplitExp                    = new RegExp(/([0-9+-]+)/);
const timeSplitExp                    = new RegExp(/([am|pm]+)/);


async function parsePage({ matchupId, html }) {
  const $ = cheerio.load(html);
  const wrappingTable = $('.rt_railbox_border').find('table').eq(1);
  const year = 2010;

  const oddsList = wrappingTable.find('tr').filter((_i, row) => {
    // if no slash in date, this is some kind of header row. filter out
    const date = $(row).find('td').eq(0).text();
    return date.includes('/');
  }).map((_i, el) => {
    const $row            = $(el);
    const dateString      = $row.find('td').eq(0).text().split('/');
    const month           = dateString[0];
    const day             = dateString[1];
    const time            = $row.find('td').eq(1).text().split(timeSplitExp);
    const hours           = time[0].split(':')[0];
    const minutes         = time[0].split(':')[1];
    const isPm            = time[1] === 'pm';
    const favTeamTerm     = $row.find('td').eq(2).text().trim().split(oddsSplitExp)[0].split(' ')[0];
    const dogTeamTerm     = $row.find('td').eq(3).text().trim().split(oddsSplitExp)[0].split(' ')[0];
    const favMoneyline    = parseToFloatOrNull($row.find('td').eq(2).text().trim().split(oddsSplitExp)[1]);
    const dogMoneyline    = parseToFloatOrNull($row.find('td').eq(3).text().trim().split(oddsSplitExp)[1]);
    const favPoints       = parseToFloatOrNull($row.find('td').eq(4).text().trim().split(oddsSplitExp)[1]);
    const dogPoints       = parseToFloatOrNull($row.find('td').eq(5).text().trim().split(oddsSplitExp)[1]);
    const overUnder       = parseToFloatOrNull($row.find('td').eq(6).text().trim());
    const asOf            = makeDateFromParts({ year, month, day, hours, minutes, isPm });

    return {
      asOf,
      favTeamTerm,
      dogTeamTerm,
      favMoneyline,
      dogMoneyline,
      favPoints,
      dogPoints,
      overUnder,
    };
  }).get();

  const {
    favTeamTerm: headFavTeamTerm,
    dogTeamTerm: headDogTeamTerm,
  }                                   = oddsList[0];
  const league                        = await getLeagueByMatchupId(matchupId);
  const matchup                       = await getMatchupById(matchupId);
  const headFavTeamId                 = await getTeamIdByLeagueAndTerm(league, headFavTeamTerm);
  const headDogTeamId                 = await getTeamIdByLeagueAndTerm(league, headDogTeamTerm);
  const teamTermMap                   = {
    [headFavTeamTerm] : headFavTeamId === matchup.team_a_id ? 'teamA' : 'teamB',
    [headDogTeamTerm] : headDogTeamId === matchup.team_a_id ? 'teamA' : 'teamB',
  };

  if (teamTermMap[headFavTeamTerm] === teamTermMap[headDogTeamTerm]) {
    console.warn(`Cannot determine odds based on team terms: ${headFavTeamTerm}|${headDogTeamTerm}`);
    const err = new Error('Conflict');
    return Promise.reject(err);
  }

  const oddsData = oddsList.map((oddsSet) => {
    const { overUnder, asOf } = oddsSet;
    let teamAMoneyline;
    let teamBMoneyline;
    let teamAPoints;
    let teamBPoints;

    if (teamTermMap[oddsSet.favTeamTerm] === 'teamA') {
      teamAMoneyline  = oddsSet.favMoneyline;
      teamBMoneyline  = oddsSet.dogMoneyline;
      teamAPoints     = oddsSet.favPoints;
      teamBPoints     = oddsSet.dogPoints;
    } else {
      teamAMoneyline  = oddsSet.dogMoneyline;
      teamBMoneyline  = oddsSet.favMoneyline;
      teamAPoints     = oddsSet.dogPoints;
      teamBPoints     = oddsSet.favPoints;
    }

    return {
      asOf,
      matchupId,
      teamAMoneyline,
      teamBMoneyline,
      teamAPoints,
      teamBPoints,
      overUnder,
    };
  });

  const oddsInserts = oddsData.map(insertOdds);
  return Promise.all(oddsInserts);
}


async function fetchParseSeed({ matchupId, oddsLink }) {
  const oddsMovementPageHtml  = await fetchHtml(oddsLink);
  const odds                  = await parsePage({ matchupId, html: oddsMovementPageHtml });
  const oddsInserts           = odds.map(insertOdds);

  console.log(`inserting ${oddsInserts.length} odds records...`);
  await Promise.all(oddsInserts);
}


async function execute() {
  const matchups      = await getMatchupsWithoutOddsRows();
  const oddsMatchups  = matchups.map((m) => ({
    matchupId : m.id,
    oddsLink  : m.odds_link,
  }));

  for (const oddsMatchup of oddsMatchups) {
    try {
      await fetchParseSeed(oddsMatchup);
    } catch (err) {
      console.error(err);
    }
  }
}


execute().then(() => {
  const endTime  = new Date().getTime();
  const timeDiff = (endTime - startTime) / 1000;

  console.log(`seeded matchups in ${timeDiff} seconds`);
});
