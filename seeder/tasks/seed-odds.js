const cheerio                         = require('cheerio');
const { DateTime }                    = require('luxon');

const { insert: insertOdds }          = require('../model/odds');
const { getTeamIdByLeagueAndTerm }    = require('../model/team');
const { getById: getMatchupById }     = require('../model/matchup');
const { getLeagueByMatchupId }        = require('../model/matchup');
const { getMatchupsWithoutOddsRows }  = require('../model/matchup');
const { fetchHtml }                   = require('../util');
const { parseToFloatOrNull }          = require('../util');

const fromDateTimeFormat              = 'LL/dd yyyy h:mma';
const defaulTimeZone                  = 'America/New_York';
const startTime                       = new Date().getTime();
const oddsSplitExp                    = new RegExp(/([0-9+-]+)/);

async function parsePage({ matchupId, html, url }) {
  console.log(`parsing odds data from ${url}`);

  const $ = cheerio.load(html);
  const wrappingTable = $('.rt_railbox_border').find('table').eq(1);
  const yearString = $('.SLTables1').find('table').eq(1).find('td').eq(0).text().trim();
  const year = yearString.substr(yearString.length - 4);

  const oddsList = wrappingTable.find('tr').filter((_i, el) => {
    // filter out if there's no date or no team term
    const $row            = $(el);
    const date            = $row.find('td').eq(0).text();
    const favTeamTerm     = $row.find('td').eq(2).text().trim().split(oddsSplitExp)[0].split(' ')[0];
    const dogTeamTerm     = $row.find('td').eq(3).text().trim().split(oddsSplitExp)[0].split(' ')[0];
    return date.includes('/') && favTeamTerm && dogTeamTerm;
  }).map((_i, el) => {
    const $row            = $(el);
    const dateString      = $row.find('td').eq(0).text().trim();
    const timeString      = $row.find('td').eq(1).text().trim();
    const favTeamTerm     = $row.find('td').eq(2).text().trim().split(oddsSplitExp)[0].split(' ')[0];
    const dogTeamTerm     = $row.find('td').eq(3).text().trim().split(oddsSplitExp)[0].split(' ')[0];
    const favMoneyline    = parseToFloatOrNull($row.find('td').eq(2).text().trim().split(oddsSplitExp)[1]);
    const dogMoneyline    = parseToFloatOrNull($row.find('td').eq(3).text().trim().split(oddsSplitExp)[1]);
    const favPoints       = parseToFloatOrNull($row.find('td').eq(4).text().trim().split(oddsSplitExp)[1]);
    const dogPoints       = parseToFloatOrNull($row.find('td').eq(5).text().trim().split(oddsSplitExp)[1]);
    const overUnder       = parseToFloatOrNull($row.find('td').eq(6).text().trim());

    const dateTimeString  = `${dateString} ${year} ${timeString}`;
    const dateObject      = DateTime.fromFormat(dateTimeString, fromDateTimeFormat, {
      zone: defaulTimeZone,
    });
    const asOf            = dateObject.toUTC().toISO();

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

  if (!oddsList.length) {
    const err = new Error(`No odds found at: ${url}`);
    return Promise.reject(err);
  }

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
    const err = new Error(`Cannot determine odds based on team terms: ${headFavTeamTerm} | ${headDogTeamTerm}`);
    return Promise.reject(err);
  }

  const oddsData = oddsList.map(async (oddsSet) => {
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

    if (!asOf || !matchupId) {
      const err = new Error(`Parsing error: ${asOf} | ${matchupId}`);
      return Promise.reject(err);
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

  return Promise.allSettled(oddsData);
}

async function fetchParseSeed({ matchupId, oddsLink }) {
  const oddsMovementPageHtml  = await fetchHtml(oddsLink);
  const odds                  = await parsePage({ matchupId, html: oddsMovementPageHtml, url: oddsLink });
  const oddsFulfilled         = odds.filter((res) => res.status === 'fulfilled').map((res) => res.value);
  const oddsRejected          = odds.filter((res) => res.status === 'rejected').map((res) => res.reason.message);

  oddsRejected.forEach(console.error);

  console.log(`inserting ${oddsFulfilled.length} odds records...`);
  return Promise.all(oddsFulfilled.map(insertOdds));
}

async function execute() {
  const matchups      = await getMatchupsWithoutOddsRows(100);
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

  if (oddsMatchups.length) await execute();
}

execute().then(() => {
  const endTime  = new Date().getTime();
  const timeDiff = (endTime - startTime) / 1000;

  console.log(`seeded odds in ${timeDiff} seconds`);
  process.exit();
});
