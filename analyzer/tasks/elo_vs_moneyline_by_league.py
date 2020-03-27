import seaborn as sns
import pandas as pd
import analyzer.sql as sql
import analyzer.lib.probability as probability
import analyzer.lib.util as util


query = {
  "independent_range": sql.file("elo_diff"),
  "elo_matchup": sql.file("elo_matchup"),
  "elo_moneyline": sql.file("elo_moneyline"),
  "elo_matchup_where_home_field": sql.file("elo_matchup_where_home_field"),
  "elo_matchup_where_away_field": sql.file("elo_matchup_where_away_field")
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

    moneyline_dependent_tuples, moneyline_independent_tuples = util.build_tuples_and_tuples_from_sql(
      query["elo_moneyline"],
      {"league": league}
    )

    matchup_probabilities = probability.get_logistic_regression_probabilties(
      matchup_dependent_list,
      matchup_independent_tuples,
      independent_range
    )

    moneyline_probabilities = probability.get_polynomnial_regression_probabilities(
      moneyline_dependent_tuples,
      moneyline_independent_tuples,
      independent_range
    )

    data_frame_dictionary = dict(
      elo=independent_range,
      base=matchup_probabilities,
      moneyline=moneyline_probabilities
    )

    data_frame = pd.DataFrame(data_frame_dictionary)

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
    plot.get_figure().savefig("out/elo-vs-moneyline-by-league-%s.png" % league)
