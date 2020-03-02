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
  recap_link VARCHAR(255),
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

CREATE OR REPLACE VIEW elo_outcome(elo_predicted_outcome, even_elo, elo_diff, elo_probability, matchup_id, elo_team_a, elo_team_b) AS
SELECT t.team_a_score > t.team_b_score AND t.elo_team_a > t.elo_team_b OR
       t.team_b_score > t.team_a_score AND t.elo_team_b > t.elo_team_a AS elo_predicted_outcome,
       t.elo_team_a = t.elo_team_b                                     AS even_elo,
       ABS(t.elo_team_a - t.elo_team_b)                                AS elo_diff,
       CASE
           WHEN abs(t.elo_team_a - t.elo_team_b) >= 350 THEN 0.952
           WHEN abs(t.elo_team_a - t.elo_team_b) >= 300 AND abs(t.elo_team_a - t.elo_team_b) < 350 THEN 0.878
           WHEN abs(t.elo_team_a - t.elo_team_b) >= 250 AND abs(t.elo_team_a - t.elo_team_b) < 300 THEN 0.802
           WHEN abs(t.elo_team_a - t.elo_team_b) >= 200 AND abs(t.elo_team_a - t.elo_team_b) < 250 THEN 0.753
           WHEN abs(t.elo_team_a - t.elo_team_b) >= 150 AND abs(t.elo_team_a - t.elo_team_b) < 200 THEN 0.722
           WHEN abs(t.elo_team_a - t.elo_team_b) >= 100 AND abs(t.elo_team_a - t.elo_team_b) < 150 THEN 0.643
           WHEN abs(t.elo_team_a - t.elo_team_b) >= 50  AND abs(t.elo_team_a - t.elo_team_b) < 100 THEN 0.594
           WHEN abs(t.elo_team_a - t.elo_team_b) >= 0   AND abs(t.elo_team_a - t.elo_team_b) < 50  THEN 0.506
           ELSE 0.0
       END AS elo_probability,
       t.matchup_id,
       t.elo_team_a,
       t.elo_team_b
FROM (SELECT matchup.id     AS matchup_id,
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
                                          elo.elo
                                   FROM elo
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

CREATE OR REPLACE VIEW moneyline_probability(odds_id, matchup_id, team_a_probability, team_b_probability) AS
SELECT odds.id AS odds_id,
       odds.matchup_id,
       CASE
           WHEN (odds.team_a_moneyline > 0)
               THEN 100 / (odds.team_a_moneyline::float + 100)
           ELSE
               ABS(odds.team_a_moneyline::float) / (ABS(odds.team_a_moneyline)::float + 100)
           END
               AS team_a_probability,
       CASE
           WHEN (odds.team_b_moneyline > 0)
               THEN 100 / (odds.team_b_moneyline::float + 100)
           ELSE
               ABS(odds.team_b_moneyline::float) / (ABS(odds.team_b_moneyline)::float + 100)
           END AS team_b_probability
FROM odds
WHERE odds.team_a_moneyline IS NOT NULL
  AND odds.team_b_moneyline IS NOT NULL;

ALTER TABLE elo_outcome OWNER TO postgres;
ALTER TABLE moneyline_probability OWNER TO postgres;