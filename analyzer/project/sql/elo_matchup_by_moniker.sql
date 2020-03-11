SELECT elo_predicted_outcome::int,
       elo_diff
FROM elo_matchup
LEFT JOIN matchup ON matchup.id = elo_matchup.matchup_id
LEFT JOIN team ON matchup.team_a_id = team.id OR matchup.team_b_id = team.id
WHERE team.moniker = '[moniker]'
ORDER BY elo_diff DESC;