CREATE TYPE league AS ENUM ('NFL', 'NBA', 'MLB', 'NHL');

CREATE TABLE team (
  id SERIAL PRIMARY KEY,
  moniker VARCHAR(255),
  location VARCHAR(255),
  league league,
  UNIQUE(moniker, location, league)
);

CREATE TABLE elo (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES team,
  as_of TIMESTAMP NOT NULL,
  elo INT NOT NULL,
  UNIQUE(team_id, as_of, elo)
);

CREATE TABLE matchup (
  id SERIAL PRIMARY KEY,
  start_time TIMESTAMP,
  team_a_id INTEGER REFERENCES team,
  team_b_id INTEGER REFERENCES team,
  team_a_score INTEGER NOT NULL,
  team_b_score INTEGER NOT NULL,
  team_a_is_home BOOLEAN,
  team_b_is_home BOOLEAN,
  odds_link VARCHAR(255),
  fetched_from VARCHAR(255),
  UNIQUE(start_time, team_a_id, team_b_id)
);

CREATE TABLE odds (
  id SERIAL PRIMARY KEY,
  as_of TIMESTAMP NOT NULL,
  matchup_id INTEGER REFERENCES matchup ON DELETE CASCADE,
  team_a_moneyline SMALLINT,
  team_b_moneyline SMALLINT,
  team_a_points SMALLINT,
  team_b_points SMALLINT,
  over_under SMALLINT,
  UNIQUE(as_of, matchup_id)
);

CREATE TABLE team_search_term (
  team_id INTEGER REFERENCES team,
  term VARCHAR(255),
  UNIQUE(team_id, term)
);

CREATE OR REPLACE VIEW elo_matchup(matchup_id, league, elo_predicted_outcome, even_elo, elo_diff, elo_team_a, elo_team_b) AS
SELECT t.matchup_id,
       t.league,
       t.team_a_score > t.team_b_score AND t.elo_team_a > t.elo_team_b OR
       t.team_b_score > t.team_a_score AND t.elo_team_b > t.elo_team_a AS elo_predicted_outcome,
       t.elo_team_a = t.elo_team_b                                     AS even_elo,
       ABS(t.elo_team_a - t.elo_team_b)                                AS elo_diff,
       t.elo_team_a,
       t.elo_team_b
FROM (SELECT matchup.id     AS matchup_id,
             elo_team_a.league,
             matchup.team_a_score,
             matchup.team_b_score,
             elo_team_a.elo AS elo_team_a,
             elo_team_b.elo AS elo_team_b
      FROM matchup
               LEFT JOIN team team_a ON team_a.id = matchup.team_a_id
               LEFT JOIN team team_b ON team_b.id = matchup.team_b_id
               LEFT JOIN LATERAL ( SELECT elo.id,
                                          elo.team_id,
                                          elo.as_of,
                                          elo.elo,
                                          team.league
                                   FROM elo
                                   LEFT JOIN team ON team.id = elo.team_id
                                   WHERE elo.as_of < matchup.start_time
                                     AND elo.team_id = team_a.id
                                   ORDER BY elo.as_of DESC
                                   LIMIT 1) elo_team_a ON elo_team_a.team_id = team_a.id
               LEFT JOIN LATERAL ( SELECT elo.id,
                                          elo.team_id,
                                          elo.as_of,
                                          elo.elo
                                   FROM elo
                                   WHERE elo.as_of < matchup.start_time
                                     AND elo.team_id = team_b.id
                                   ORDER BY elo.as_of DESC
                                   LIMIT 1) elo_team_b ON elo_team_b.team_id = team_b.id
      WHERE matchup.start_time IS NOT NULL
      ORDER BY matchup.start_time) t
ORDER BY (abs(t.elo_team_a - t.elo_team_b)) DESC;

CREATE OR REPLACE VIEW moneyline_probability(matchup_id, odds_id, league, moneyline_predicted_outcome, team_a_implied_probability, team_b_implied_probability) AS
SELECT odds.matchup_id,
       odds.id AS odds_id,
       team.league,
       matchup.team_a_score > matchup.team_b_score AND odds.team_a_moneyline < odds.team_b_moneyline OR
       matchup.team_b_score > matchup.team_a_score AND odds.team_b_moneyline < odds.team_a_moneyline AS moneyline_predicted_outcome,
       CASE
           WHEN (odds.team_a_moneyline > 0)
               THEN 100 / (odds.team_a_moneyline::float + 100)
           ELSE
               ABS(odds.team_a_moneyline::float) / (ABS(odds.team_a_moneyline)::float + 100)
           END
               AS team_a_implied_probability,
       CASE
           WHEN (odds.team_b_moneyline > 0)
               THEN 100 / (odds.team_b_moneyline::float + 100)
           ELSE
               ABS(odds.team_b_moneyline::float) / (ABS(odds.team_b_moneyline)::float + 100)
           END AS team_b_implied_probability
FROM odds
LEFT JOIN matchup ON matchup.id = odds.matchup_id
LEFT JOIN team ON team.id = matchup.team_a_id
WHERE odds.team_a_moneyline IS NOT NULL
  AND odds.team_b_moneyline IS NOT NULL;

CREATE OR REPLACE VIEW moneyline_matchup_probability(matchup_id, odds_id, league, moneyline_predicted_outcome, team_a_implied_probability, team_b_implied_probability) AS
SELECT matchup.id as matchup_id,
       o.id AS odds_id,
       o.league,
       o.moneyline_predicted_outcome,
       o.team_a_implied_probability,
       o.team_b_implied_probability
FROM matchup
LEFT JOIN LATERAL (
    SELECT odds.id,
           odds.matchup_id,
           moneyline_probability.league,
           moneyline_probability.moneyline_predicted_outcome,
           moneyline_probability.team_a_implied_probability,
           moneyline_probability.team_b_implied_probability
    FROM odds
             LEFT JOIN moneyline_probability ON moneyline_probability.odds_id = odds.id
    WHERE odds.as_of < matchup.start_time AND odds.matchup_id = matchup.id
    ORDER BY odds.as_of DESC
    LIMIT 1
) o ON matchup.id = o.matchup_id
WHERE o.id IS NOT NULL
  AND team_a_implied_probability IS NOT NULL
  AND team_b_implied_probability IS NOT NULL;
