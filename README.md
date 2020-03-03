# Cajetan
Predictive analytics for professional American sports

<a href="https://en.wikipedia.org/wiki/Saint_Cajetan" title="blank">
  <img src="https://f7hnjran9v-flywheel.netdna-ssl.com/wp-content/uploads/2019/07/Tiepolo_-_S%C3%A3o_Caetano_de_Tiene_2.jpg" width="200" alt="St. Cajetan" title="St. Cajetan">
</a>


## Getting Started
* Dependencies: [node](https://nodejs.org/en/), [docker](https://www.docker.com/), [make](https://www.gnu.org/software/make/manual/make.html).
* `make init`: Installs dependencies. Migrates and seeds the database.


## Database

### Tables and Views
* *[ELO](https://en.wikipedia.org/wiki/Elo_rating_system)*: Objective rankings per team with as of timestamp.
* *Matchup*: A competition between 2 teams. Includes start time, score, home team and links for matchup details.
* *Odds*: Moneyline and point odds for a given matchup. Several odds rows exist for a single matchup. Odds are updated throughout the course of a live matchup.
* *Team*: The moniker, location and league of a team.
* *Team Search Term*: A search term for a given team.
* *[ELO](https://en.wikipedia.org/wiki/Elo_rating_system) Matchup Probability*: Whether or not the ELO rankings correctly predicted a matchup's result. Contains ELO ratings for the teams in the matchup and the diff of the team's ELO ratings.
* *Moneyline Matchup Probability*: Whether or not the closing moneyline correctly predicted the matchup's result. Contains implied probabilities (the moneyline odds converted to probability).
* *Moneyline Probability*: Whether or not a given moneyline correctly predicted the matchup's result. Contains implied probabilities (the moneyline odds converted to probability).

### ENUMS
* *League*: NFL, NHL, NBA, MLB
