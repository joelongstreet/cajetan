const request = require('request-promise');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36';

function parseToFloatOrNull(stringyNumber) {
  const float = Number.parseFloat(stringyNumber);
  return Number.isNaN(float) ? null : float;
}

async function fetchHtml(uri) {
  const opts = {
    headers: {
      'User-Agent': userAgent,
    },
    uri,
  };

  return request(opts);
}

function makeDateFromParts({
  year, month, day, hours, minutes, isPm,
}) {
  let hrs = parseFloat(hours);
  if (isPm && hrs < 12) hrs += 12;
  if (!isPm && hrs === 12) hrs = 0;

  return `${year}-${month}-${day} ${hrs}:${minutes}:00.000000`;
}

module.exports = {
  parseToFloatOrNull,
  fetchHtml,
  makeDateFromParts,
};
