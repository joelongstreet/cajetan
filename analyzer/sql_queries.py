queries = {
  "basic": """SELECT
    elo_predicted_outcome::int,
    elo_diff
    FROM elo_matchup
    ORDER BY matchup_id;"""
}
