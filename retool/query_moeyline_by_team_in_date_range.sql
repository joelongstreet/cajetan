SELECT
  odds.as_of,
  team.moniker,
  odds.team_a_moneyline
FROM odds
LEFT JOIN matchup on odds.matchup_id = matchup.id
LEFT JOIN team on matchup.team_a_id = team.id
WHERE
  odds.as_of >= '{{moment(input_dateRange.startValue).format('YYYY-MM-DD')}}'
  AND odds.as_of <= '{{moment(input_dateRange.endValue).format('YYYY-MM-DD')}}'
  AND team.moniker IN ({{select_teams.value.map((d) => `'${d}'`).join(',')}})
UNION
SELECT
  odds.as_of,
  team.moniker,
  odds.team_b_moneyline
FROM odds
LEFT JOIN matchup on odds.matchup_id = matchup.id
LEFT JOIN team on matchup.team_b_id = team.id
WHERE
  odds.as_of >= '{{moment(input_dateRange.startValue).format('YYYY-MM-DD')}}'
  AND odds.as_of <= '{{moment(input_dateRange.endValue).format('YYYY-MM-DD')}}'
  AND team.moniker IN ({{select_teams.value.map((d) => `'${d}'`).join(',')}})
;