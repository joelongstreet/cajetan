const cheerio                       = require('cheerio');

const { fetchHtml }                 = require('../util');
const { parseToFloatOrNull }        = require('../util');
const { getTeamIdByLeagueAndTerm }  = require('../model/team');
const { insert: insertMatchup }     = require('../model/matchup');

const startTime                     = new Date().getTime();
const baseUrl                       = 'https://www.vegasinsider.com';
const leaguesMatchupsUrls           = [
  (() => {
    // NFL
    const firstYear   = 2010;
    const yearLength  = new Date().getFullYear() - firstYear;

    // 1...22 (22 weeks in an nfl season including playoffs)
    // exclude week 21 - the pro bowl
    const weeks = Array.from({ length: 22 }, (_x, y) => y + 1)
      .filter((w) => w !== 21);
    // 2010...2019 (all the years that work for the base url)
    const years = Array.from({ length: yearLength }, (_x, y) => y + firstYear);

    const urls = years.map((y) => (
      weeks.map((w) => `${baseUrl}/nfl/scoreboard/scores.cfm/week/${w}/season/${y}`)
    )).flat(2);

    return urls.map((matchupsUrl) => ({ matchupsUrl, league: 'NFL' }));
  })(),
].flat();


async function parsePage({ league, html, url }) {
  console.log(`parsing data from ${url}`);

  const $ = cheerio.load(html);
  const matchups = $('.sportPicksBorder').map((_i, scoreboard) => {
    const table             = $(scoreboard).find('table');

    const rowA              = table.find('tr').eq(3);
    const rowB              = table.find('tr').eq(4);
    const metaRow           = table.find('tr').eq(5);

    const teamATerm         = rowA.find('td').eq(0).find('a').text().trim();
    const teamBTerm         = rowB.find('td').eq(0).find('a').text().trim();
    const teamAIsHome       = rowA.find('td').eq(0).find('font').text().trim() !== '';
    const teamBIsHome       = rowB.find('td').eq(0).find('font').text().trim() !== '';
    const teamAScore        = parseToFloatOrNull(rowA.find('td').eq(6).text().trim());
    const teamBScore        = parseToFloatOrNull(rowB.find('td').eq(6).text().trim());

    const oddsMovementPart  = metaRow.find('a').eq(0).attr('href');
    const recapUrlPart      = metaRow.find('a').eq(1).attr('href');

    const oddsLink          = `${baseUrl}${oddsMovementPart}`;
    const recapLink         = `${baseUrl}${recapUrlPart}`;

    return {
      teamATerm,
      teamBTerm,
      teamAScore,
      teamBScore,
      teamAIsHome,
      teamBIsHome,
      oddsLink,
      recapLink,
    };
  }).get();

  async function getMatchupTeamIds(matchup) {
    const {
      teamAIsHome,
      teamBIsHome,
      teamATerm,
      teamBTerm,
      teamAScore,
      teamBScore,
    } = matchup;

    const hasHomeTeamXor = (teamAIsHome && !teamBIsHome) || (!teamAIsHome && teamBIsHome);
    if (
      !teamATerm || !teamBTerm || !hasHomeTeamXor
      || Number.isNaN(teamAScore) || Number.isNaN(teamBScore)
    ) {
      const err = new Error(
        `Parsing error: ${teamATerm} | ${teamBTerm} | ${hasHomeTeamXor} | ${teamAScore} | ${teamBScore} | ${url}`,
      );
      return Promise.reject(err);
    }

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


async function fetchParseSeed({ league, matchupsUrl }) {
  console.log(`fetching data from ${matchupsUrl}`);

  const matchupPageHtml   = await fetchHtml(matchupsUrl);
  const matchupsRes       = await parsePage({ league, html: matchupPageHtml, url: matchupsUrl });
  const matchupsFulfilled = matchupsRes.filter((res) => res.status === 'fulfilled').map((res) => res.value);
  const matchupsRejected  = matchupsRes.filter((res) => res.status === 'rejected').map((res) => res.reason.message);

  matchupsRejected.forEach(console.error);

  console.log(`inserting ${matchupsFulfilled.length} matchup records...`);
  return Promise.all(matchupsFulfilled.map(insertMatchup));
}


async function execute() {
  for (const leagueMatchupsUrl of leaguesMatchupsUrls) {
    try {
      await fetchParseSeed(leagueMatchupsUrl);
    } catch (err) {
      console.error(err);
    }
  }
}


execute().then(() => {
  const endTime  = new Date().getTime();
  const timeDiff = (endTime - startTime) / 1000;

  console.log(`seeded matchups in ${timeDiff} seconds`);
  process.exit();
});
