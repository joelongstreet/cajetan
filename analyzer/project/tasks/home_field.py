import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

import project.sql as sql
import project.lib.probability as probability


query = {
  "independent_range": sql.file("elo_diff"),
  "elo_matchup": sql.file("elo_matchup"),
  "elo_moneyline": sql.file("elo_moneyline"),
  "elo_matchup_where_home_field": sql.file("elo_matchup_where_home_field"),
  "elo_matchup_where_away_field": sql.file("elo_matchup_where_away_field")
}


def execute():
    independent_range = probability.get_independent_range(
      query["independent_range"]
    )

    matchup_probabilities = probability.get_logistic_regression_probabilties(
      query["elo_matchup"],
      independent_range
    )

    matchup_homefield_probabilities = probability.get_logistic_regression_probabilties(
      query["elo_matchup_where_home_field"],
      independent_range
    )

    matchup_awayfield_probabilities = probability.get_logistic_regression_probabilties(
      query["elo_matchup_where_away_field"],
      independent_range
    )

    moneyline_probabilities = probability.get_polynomnial_regression_probabilities(
      query["elo_moneyline"],
      independent_range
    )

    data_frame_dictionary = dict(
      elo=independent_range,
      base=matchup_probabilities,
      homefield=matchup_homefield_probabilities,
      awayfield=matchup_awayfield_probabilities,
      moneyline=moneyline_probabilities
    )

    data_frame = pd.DataFrame(data_frame_dictionary)

    plt.figure(figsize=(12, 12))

    plot = sns.lineplot(
      x="elo",
      y="value",
      hue="variable",
      data=pd.melt(
        data_frame, ['elo']
      )
    )

    plot.set_xlabel("Elo Diff", fontsize=25)
    plot.set_ylabel("Probability", fontsize=25)
    plot.get_figure().savefig("out/home-field.png")
