import seaborn as sns
import pandas as pd

import project.sql as sql
import project.lib.probability as probability


query = {
  "independent_range": sql.file("elo_independent_range"),
  "elo_matchup": sql.file("elo_matchup"),
  "elo_matchup_home_field_advantage": sql.file("elo_matchup_home_field_advantage")
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
      query["elo_matchup_home_field_advantage"],
      independent_range
    )

    data_frame = pd.DataFrame({
      "elo": independent_range,
      "base": matchup_probabilities,
      "homefield": matchup_homefield_probabilities
    })

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

    plot.get_figure().savefig("out/analyze-home-field.png")
