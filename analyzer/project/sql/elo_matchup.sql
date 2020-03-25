SELECT elo_predicted_outcome::int,
       elo_diff
FROM elo_matchup
WHERE league IN ('{league}')
ORDER BY elo_diff DESC;