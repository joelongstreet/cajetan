SELECT elo_diff, AVG(implied_probability) FROM (
  SELECT elo_matchup.elo_diff,
    CASE
      WHEN elo_matchup.elo_team_a > elo_matchup.elo_team_b
        THEN moneyline_matchup_probability.team_a_implied_probability
      ELSE moneyline_matchup_probability.team_b_implied_probability
      END AS implied_probability
  FROM moneyline_matchup_probability
    LEFT JOIN elo_matchup
      ON elo_matchup.matchup_id = moneyline_matchup_probability.matchup_id
  WHERE moneyline_matchup_probability.moneyline_predicted_outcome = FALSE
) AS d
GROUP BY elo_diff
ORDER BY elo_diff DESC;