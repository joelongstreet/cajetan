const cheerio                                 = require('cheerio');
const { DateTime }                            = require('luxon');

const {
  updateStartTime: updateStartTimeForMatchup,
}                                             = require('../model/matchup');
const { fetchHtml }                           = require('../util');
const { getMatchupsWithoutStartTimes }        = require('../model/matchup');

const fromDateTimeFormat                      = 'LLLL dd, yyyy h:mm a';
const defaulTimeZone                          = 'America/New_York';
const startTime                               = new Date().getTime();


function parsePage({ html, url, matchupId }) {
  console.log(`parsing matchup time data from ${url} for matchup ${matchupId}`);

  const $ = cheerio.load(html);

  const dates = $('.sub_title_red').filter((_i, el) => (
    $(el).text().includes('Date:')
  )).map((_i, el) => (
    $(el).text()
  )).get();

  const head = dates[0];
  if (!head) return null;

  const dateString  = head.split('Date: ')[1].split(' EDT')[0];
  const dateObject  = DateTime.fromFormat(dateString, fromDateTimeFormat, {
    zone: defaulTimeZone,
  });

  return dateObject.toUTC().toISO();
}


async function fetchParseSeed({ matchupId, recapLink }) {
  console.log(`fetching matchup time data from ${recapLink}`);

  const html = await fetchHtml(recapLink);

  try {
    const matchupStartTime = parsePage({ html, url: recapLink, matchupId });
    console.log(`inserting matchup time for matchup ${matchupId}: ${matchupStartTime}...`);
    await updateStartTimeForMatchup({ matchupId, startTime: matchupStartTime });
  } catch (e) {
    console.error(e);
  }

  Promise.resolve();
}


async function execute() {
  const matchups = await getMatchupsWithoutStartTimes(100);

  for (const matchup of matchups) {
    try {
      await fetchParseSeed(matchup);
    } catch (err) {
      console.error(err);
    }
  }

  if (matchups.length) await execute();
}


execute().then(() => {
  const endTime  = new Date().getTime();
  const timeDiff = (endTime - startTime) / 1000;

  console.log(`seeded matchup times in ${timeDiff} seconds`);
  process.exit();
});
