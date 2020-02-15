CREATE TYPE league AS ENUM ('NFL', 'NBA', 'MLB', 'NHL');

CREATE TABLE team (
  id SERIAL PRIMARY KEY,
  moniker VARCHAR(255),
  location VARCHAR(255),
  league league
);

CREATE TABLE elo (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES team,
  as_of TIMESTAMP NOT NULL,
  elo INT NOT NULL
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
  recap_link VARCHAR(255)
);

CREATE TABLE odds (
  id SERIAL PRIMARY KEY,
  as_of TIMESTAMP NOT NULL,
  matchup_id INTEGER REFERENCES matchup,
  team_a_moneyline SMALLINT,
  team_b_moneyline SMALLINT,
  team_a_points SMALLINT,
  team_b_points SMALLINT,
  over_under SMALLINT
);

INSERT INTO team (moniker, location, league) VALUES ('Cardinals',   'Arizona',        'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Falcons',     'Atlanta',        'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Ravens',      'Baltimore',      'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Bills',       'Buffalo',        'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Panthers',    'Carolina',       'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Bears',       'Chicago',        'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Bengals',     'Cincinnati',     'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Browns',      'Cleveland',      'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Cowboys',     'Dallas',         'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Broncos',     'Denver',         'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Lions',       'Detroit',        'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Packers',     'Green Bay',      'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Texans',      'Houston',        'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Colts',       'Indianapolis',   'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Jaguars',     'Jacksonville',   'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Chiefs',      'Kansas City',    'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Raiders',     'Las Vegas',      'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Chargers',    'Los Angeles',    'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Rams',        'Los Angeles',    'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Dolphins',    'Miami',          'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Vikings',     'Minnesota',      'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Patriots',    'New England',    'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Saints',      'New Orleans',    'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Giants',      'New York',       'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Jets',        'New York',       'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Eagles',      'Philadelphia',   'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Steelers',    'Pittsburgh',     'NFL');
INSERT INTO team (moniker, location, league) VALUES ('49ers',       'San Francisco',  'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Seahawks',    'Seattle',        'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Buccaneers',  'Tampa Bay',      'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Titans',      'Tennessee',      'NFL');
INSERT INTO team (moniker, location, league) VALUES ('Redskins',    'Washington',     'NFL');
