SELECT elo_predicted_outcome::int,
       elo_diff
FROM elo_matchup
         LEFT JOIN matchup on matchup.id = elo_matchup.matchup_id
WHERE (team_a_is_home = true and elo_team_a > elo_team_b)
   OR (team_b_is_home = true and elo_team_b > elo_team_a)
ORDER BY elo_diff DESC;