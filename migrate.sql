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

create or replace view elo_outcome(elo_predicted_outcome, even_elo, elo_diff, matchup_id, elo_team_a, elo_team_b) as
SELECT t.team_a_score > t.team_b_score AND t.elo_team_a > t.elo_team_b OR
       t.team_b_score > t.team_a_score AND t.elo_team_b > t.elo_team_a AS elo_predicted_outcome,
       t.elo_team_a = t.elo_team_b                                     AS even_elo,
       abs(t.elo_team_a - t.elo_team_b)                                AS elo_diff,
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

alter table elo_outcome owner to postgres;

