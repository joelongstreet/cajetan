import seaborn as sns
import pandas as pd
import analyzer.sql as sql
import analyzer.lib.probability as probability
import analyzer.lib.util as util


query = {
  "independent_range": sql.file("elo_diff"),
  "elo_matchup": sql.file("elo_matchup"),
  "elo_matchup_where_moniker": sql.file("elo_matchup_where_moniker"),
  "team_monikers": sql.file("team_monikers")
}


def execute(league):
    independent_range = util.build_list_from_sql(
      query["independent_range"],
      {"league": league}
    )

    matchup_dependent_list, matchup_independent_tuples = util.build_list_and_tuples_from_sql(
      query["elo_matchup"],
      {"league": league}
    )

    matchup_probabilities = probability.get_logistic_regression_probabilties(
      matchup_dependent_list,
      matchup_independent_tuples,
      independent_range
    )

    data_frame_dictionary = {
      "elo": independent_range,
      "base": matchup_probabilities
    }

    team_monikers = util.build_list_from_sql(
      query["team_monikers"],
      {"league": league}
    )

    for moniker in team_monikers:
        dependent_moniker_list, independent_moniker_tuples = util.build_list_and_tuples_from_sql(
          query["elo_matchup_where_moniker"],
          {"moniker": moniker}
        )

        data_frame_dictionary[moniker] = probability.get_logistic_regression_probabilties(
          dependent_moniker_list,
          independent_moniker_tuples,
          independent_range
        )

    data_frame = pd.DataFrame(data_frame_dictionary)

    plot = sns.lineplot(
      x="elo",
      y="value",
      hue="variable",
      data=pd.melt(
        data_frame, ["elo"]
      )
    )

    plot.set(
      xlabel="Elo difference between teams",
      ylabel="Probability of predicting victory"
    )

    plot.get_figure().savefig("out/logistic-regression-by-team-%s.png" % league)
