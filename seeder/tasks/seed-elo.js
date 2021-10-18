const request                         = require('request-promise');
const parse                           = require('csv-parse/lib/sync');
const { DateTime }                    = require('luxon');
const { insert: insertElo }           = require('../model/elo');
const { getTeamIdsByLeagueAndTerms }  = require('../model/team');

const fromDateTimeFormat              = 'yyyy-LL-dd';
const startTime                       = new Date().getTime();

const leagueCsvUrls = [
  {
    league        : 'NFL',
    url           : 'https://projects.fivethirtyeight.com/nfl-api/nfl_elo.csv',
    getTeamTerms  : (row) => ([row.team1, row.team2]),
    parseRow      : (row, searchTermMap) => {
      const dateObject  = DateTime.fromFormat(row.date, fromDateTimeFormat, { zone: 'UTC' });
      const asOf        = dateObject.toISO();

      return [
        {
          asOf,
          elo     : row.elo1_pre,
          teamId  : searchTermMap[row.team1],
        },
        {
          asOf,
          elo     : row.elo2_pre,
          teamId  : searchTermMap[row.team2],
        },
      ];
    },
  },
];

async function fetchCsv(url) {
  return request(url)
    .catch((error) => {
      const err = new Error(`Could not find elo csv ${url}, ${error}`);
      return Promise.reject(err);
    });
}

async function buildSearchTermMap(league, teamTerms) {
  const uniqueTeamTerms = [...new Set(teamTerms)];
  const searchTermList  = await getTeamIdsByLeagueAndTerms(league, uniqueTeamTerms);
  const searchTermMap   = searchTermList.reduce((acc, s) => {
    acc[s.term] = s.id;
    return acc;
  }, {});

  return searchTermMap;
}

async function readFetchSeed({
  league, url, parseRow, getTeamTerms,
}) {
  console.log(`fetching elo csv for ${league}`);

  const csv             = await fetchCsv(url);
  const rows            = parse(csv, { columns: true });
  const teamTerms       = rows.map(getTeamTerms).flat();
  const searchTermMap   = await buildSearchTermMap(league, teamTerms);
  const parsedRows      = rows.map((r) => parseRow(r, searchTermMap));
  const insertReady     = parsedRows.flat().filter((r) => (
    r.teamId && r.elo && r.asOf
  ));

  console.log(`inserting ${insertReady.length} elo rows for ${league}`);
  await Promise.all(insertReady.map(insertElo));
}

async function execute() {
  const tasks = leagueCsvUrls.map((leagueCsvUrl) => (
    // don't fail fast on promise.all
    readFetchSeed(leagueCsvUrl).catch((e) => e)
  ));

  return Promise.all(tasks).catch(console.error);
}

execute().then(() => {
  const endTime  = new Date().getTime();
  const timeDiff = (endTime - startTime) / 1000;

  console.log(`seeded elo in ${timeDiff} seconds`);
  process.exit();
});
