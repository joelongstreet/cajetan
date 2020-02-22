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
  start_time TIMESTAMP NOT NULL,
  team_a_id INTEGER REFERENCES team,
  team_b_id INTEGER REFERENCES team,
  team_a_score INTEGER NOT NULL,
  team_b_score INTEGER NOT NULL,
  team_a_is_home BOOLEAN,
  team_b_is_home BOOLEAN,
  odds_link VARCHAR(255),
  recap_link VARCHAR(255),
  UNIQUE(start_time, team_a_id, team_b_id)
);

CREATE TABLE odds (
  id SERIAL PRIMARY KEY,
  as_of TIMESTAMP NOT NULL,
  matchup_id INTEGER REFERENCES matchup,
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
