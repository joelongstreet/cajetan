SELECT
  ROUND(AVG(movement)) as average,
  moniker,
  odds_link
FROM (
  SELECT
    odds.matchup_id,
    team.moniker,
    matchup.odds_link,
    ABS(MIN(odds.team_a_moneyline) - MAX(odds.team_a_moneyline)) AS movement
  FROM odds
  LEFT JOIN matchup on odds.matchup_id = matchup.id
  LEFT JOIN team on matchup.team_a_id = team.id
  WHERE
    odds.as_of >= '{{moment(input_dateRange.startValue).format('YYYY-MM-DD')}}'
    AND odds.as_of <= '{{moment(input_dateRange.endValue).format('YYYY-MM-DD')}}'
    AND team.moniker IN ({{select_teams.value.map((d) => `'${d}'`).join(',')}})
  GROUP BY
    odds.matchup_id,
    team.moniker,
    matchup.odds_link
  UNION
  SELECT
    odds.matchup_id,
    team.moniker,
    matchup.odds_link,
    ABS(MIN(odds.team_b_moneyline) - MAX(odds.team_b_moneyline)) AS movement
  FROM odds
  LEFT JOIN matchup on odds.matchup_id = matchup.id
  LEFT JOIN team on matchup.team_b_id = team.id
  WHERE
    odds.as_of >= '{{moment(input_dateRange.startValue).format('YYYY-MM-DD')}}'
    AND odds.as_of <= '{{moment(input_dateRange.endValue).format('YYYY-MM-DD')}}'
    AND team.moniker IN ({{select_teams.value.map((d) => `'${d}'`).join(',')}})
  GROUP BY
    odds.matchup_id,
    team.moniker,
    matchup.odds_link
) AS d
GROUP BY moniker, odds_link
ORDER BY average;
