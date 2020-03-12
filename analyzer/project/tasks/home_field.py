import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

import project.sql as sql
import project.lib.probability as probability


query = {
  "independent_range": sql.file("elo_diff"),
  "elo_matchup": sql.file("elo_matchup"),
  "elo_matchup_where_home_field": sql.file("elo_matchup_where_home_field"),
  "elo_matchup_where_away_field": sql.file("elo_matchup_where_away_field")
}


def execute():
    independent_range = probability.getIndependentRange(
      query["independent_range"]
    )

    matchup_probabilities = probability.getProbabilties(
      query["elo_matchup"],
      independent_range
    )

    matchup_homefield_probabilities = probability.getProbabilties(
      query["elo_matchup_where_home_field"],
      independent_range
    )

    matchup_awayfield_probabilities = probability.getProbabilties(
      query["elo_matchup_where_away_field"],
      independent_range
    )

    data_frame = pd.DataFrame({
      "elo": independent_range,
      "base": matchup_probabilities,
      "homefield": matchup_homefield_probabilities,
      "awayfield": matchup_awayfield_probabilities
    })

    plt.figure(figsize=(12, 12))

    plot = sns.lineplot(
      x="elo",
      y="value",
      hue="variable",
      data=pd.melt(
        data_frame, ['elo']
      )
    )

    plot.set(
      xlabel="Elo difference betweent teams",
      ylabel="Probability of predicting victory"
    )

    plot.get_figure().savefig("out/home-field.png")
