library(sqldf)
library(glm2)
library(ggplot2)
library(cowplot)

pgConnection <- DBI::dbConnect(odbc::odbc(),
                      driver   = 'PostgreSQL Driver',
                      database = 'postgres',
                      uid      = 'postgres',
                      server   = '127.0.0.1',
                      port     = 54320)

eloOutcomes <- sqldf(
  'SELECT elo_diff, CAST(elo_predicted_outcome AS INT)
    FROM elo_outcome
    LEFT JOIN matchup on matchup.id = elo_outcome.matchup_id
    WHERE (team_a_is_home and elo_team_a > elo_team_b) OR (team_b_is_home AND elo_team_b < elo_team_a) AND elo_diff > 0;',
  connection = pgConnection)

logistic <- glm2(elo_predicted_outcome ~ ., data = eloOutcomes, family = "binomial")

predicted.data <- data.frame(
  probability.of.elo_predicted_outcome=logistic$fitted.values,
  elo_predicted_outcome=eloOutcomes$elo_predicted_outcome
)

predicted.data <- predicted.data[
  order(predicted.data$probability.of.elo_predicted_outcome, decreasing=FALSE),
]

predicted.data$rank <- 1:nrow(predicted.data)

ggplot(data=predicted.data, aes(x=rank, y=probability.of.elo_predicted_outcome)) +
  geom_point(aes(color=elo_predicted_outcome)) +
  xlab("Elo Diff") +
  ylab("Probability of elo predicting victory")
  