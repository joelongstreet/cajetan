const cheerio                       = require('cheerio');
const request                       = require('request-promise');
const { insert: insertOdds }        = require('../model/odds');
const { getTeamIdByLeagueAndTerm }  = require('../model/team');
const {
  insert: insertMatchup,
  getById: getMatchupById,
  getLeagueByMatchupId,
}                                   = require('../model/matchup');

const startTime           = new Date().getTime();
const userAgent           = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36';
const baseOddsUrl         = 'https://www.vegasinsider.com';
const oddsSplitExp        = new RegExp(/([0-9+-]+)/);
const leaguesMatchupsUrls = [
  (() => {
    // NFL
    const firstYear   = 2010;
    const yearLength  = new Date().getFullYear() - firstYear;

    // 1...22 (22 weeks in an nfl season including playoffs)
    const weeks = Array.from({ length: 22 }, (_x, y) => y + 1);
    // 2010...2019 (all the years that work for the base url)
    const years = Array.from({ length: yearLength }, (_x, y) => y + firstYear);

    const urls = years.map((y) => (
      weeks.map((w) => `${baseOddsUrl}/nfl/scoreboard/scores.cfm/week/${w}/season/${y}`)
    )).flat(2);

    return urls.map((matchupsUrl) => ({ matchupsUrl, league: 'NFL' }));
  })(),
].flat();


function parseToFloatOrNull(stringyNumber) {
  const float = parseFloat(stringyNumber);
  return Number.isNaN(float) ? null : float;
}


async function fetchHtml(uri) {
  console.log(`fetching data from ${uri}`);
  const opts = {
    headers: {
      'User-Agent': userAgent,
    },
    uri,
  };

  return request(opts);
}


async function parseMatchupsPage({ league, html, url }) {
  console.log(`parsing data from ${url}`);

  const $ = cheerio.load(html);
  const matchups = $('.scoreboardMatchUpContainer').map((_i, scoreboard) => {
    const table             = $(scoreboard).find('.sportPicksBorder').find('table');

    const rowA              = table.find('tr').eq(3);
    const rowB              = table.find('tr').eq(4);
    const metaRow           = table.find('tr').eq(5);

    const teamATerm         = rowA.find('td').eq(0).find('a').text().trim();
    const teamBTerm         = rowB.find('td').eq(0).find('a').text().trim();
    const teamAIsHome       = rowA.find('td').eq(0).find('font').text().trim() !== '';
    const teamBIsHome       = rowB.find('td').eq(0).find('font').text().trim() !== '';
    const teamAScore        = parseToFloatOrNull(rowA.find('td').eq(6).text().trim());
    const teamBScore        = parseToFloatOrNull(rowB.find('td').eq(6).text().trim());
    const startTime         = '2020-02-15 21:34:30.078552';

    const oddsMovementPart  = metaRow.find('a').eq(0).attr('href');
    const recapUrlPart      = metaRow.find('a').eq(1).attr('href');

    const oddsLink          = `${baseOddsUrl}${oddsMovementPart}`;
    const recapLink         = `${baseOddsUrl}${recapUrlPart}`;

    const hasHomeTeamXor    = (teamAIsHome && !teamBIsHome) || (!teamAIsHome && teamBIsHome);
    const ret               = {
      teamATerm,
      teamBTerm,
      teamAScore,
      teamBScore,
      teamAIsHome,
      teamBIsHome,
      startTime,
      oddsLink,
      recapLink,
    };

    if (teamATerm && teamBTerm && hasHomeTeamXor && teamAScore >= 0 && teamBScore >= 0) {
      return ret;
    }

    const err = new Error(
      `Parsing error: ${teamATerm} | ${teamBTerm} | ${hasHomeTeamXor} | ${teamAScore} | ${teamBScore} | ${url}`,
    );
    return Promise.reject(err);
  }).get();

  async function getMatchupTeamIds(matchup) {
    const teamAId = await getTeamIdByLeagueAndTerm(league, matchup.teamATerm);
    const teamBId = await getTeamIdByLeagueAndTerm(league, matchup.teamBTerm);

    return {
      teamAId,
      teamBId,
      ...matchup,
    };
  }

  const promises = matchups.map(getMatchupTeamIds);
  return Promise.allSettled(promises);
}


async function parseOddsMovementPage({ matchupId, html }) {
  const $ = cheerio.load(html);
  const wrappingTable = $('.rt_railbox_border').find('table').eq(1);

  const oddsList = wrappingTable.find('tr').filter((_i, row) => {
    // if no slash in date, this is some kind of header row. filter out
    const date = $(row).find('td').eq(0).text();
    return date.includes('/');
  }).map((_i, el) => {
    const $row            = $(el);
    const date            = $row.find('td').eq(0).text();
    const time            = $row.find('td').eq(1).text();
    const favTeamTerm     = $row.find('td').eq(2).text().trim().split(oddsSplitExp)[0].split(' ')[0];
    const dogTeamTerm     = $row.find('td').eq(3).text().trim().split(oddsSplitExp)[0].split(' ')[0];
    const favMoneyline    = parseToFloatOrNull($row.find('td').eq(2).text().trim().split(oddsSplitExp)[1]);
    const dogMoneyline    = parseToFloatOrNull($row.find('td').eq(3).text().trim().split(oddsSplitExp)[1]);
    const favPoints       = parseToFloatOrNull($row.find('td').eq(4).text().trim().split(oddsSplitExp)[1]);
    const dogPoints       = parseToFloatOrNull($row.find('td').eq(5).text().trim().split(oddsSplitExp)[1]);
    const overUnder       = parseToFloatOrNull($row.find('td').eq(6).text().trim());

    return {
      asOf: '2020-02-15 21:34:30.078552',
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


async function fetchParseSeedOdds({ matchupId, oddsLink }) {
  const oddsMovementPageHtml  = await fetchHtml(oddsLink);
  const odds                  = await parseOddsMovementPage({ matchupId, html: oddsMovementPageHtml });
  const oddsInserts           = odds.map(insertOdds);

  console.log(`inserting ${oddsInserts.length} odds records...`);
  await Promise.all(oddsInserts);
}


async function fetchParseSeedMatchups({ league, matchupsUrl }) {
  const matchupPageHtml   = await fetchHtml(matchupsUrl);
  const matchupsRes       = await parseMatchupsPage({ league, html: matchupPageHtml, url: matchupsUrl });
  const matchupsFulfilled = matchupsRes.filter((res) => res.status === 'fulfilled').map((res) => res.value);
  const matchupsRejected  = matchupsRes.filter((res) => res.status === 'rejected').map((res) => res.reason.message);

  matchupsRejected.forEach(console.error);

  console.log(`inserting ${matchupsFulfilled.length} matchup records...`);
  return Promise.all(matchupsFulfilled.map(insertMatchup));
}


async function execute() {
  const matchups = [];

  for (const leagueMatchupsUrl of leaguesMatchupsUrls) {
    try {
      const matchupsInserts     = await fetchParseSeedMatchups(leagueMatchupsUrl);
      const matchupsAbbvInserts = matchupsInserts
        .map((m) => ({ matchupId: m.id, oddsLink: m.odds_link }));

      matchups.push(matchupsAbbvInserts);
    } catch (err) {
      console.error(err);
    }
  }

  for (const matchup of matchups.flat()) {
    await fetchParseSeedOdds(matchup);
  }
}


execute().then(() => {
  const endTime  = new Date().getTime();
  const timeDiff = (endTime - startTime) / 1000;

  console.log(`seeded odds and matchups in ${timeDiff} seconds`);
});
