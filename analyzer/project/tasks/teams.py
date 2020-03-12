import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

import project.sql as sql
import project.lib.probability as probability


query = {
  "independent_range": sql.file("elo_diff"),
  "elo_matchup": sql.file("elo_matchup"),
  "elo_matchup_where_moniker": sql.file("elo_matchup_where_moniker"),
  "team_monikers": sql.file("team_monikers")
}


def execute():
    independent_range = probability.getIndependentRange(
      query["independent_range"]
    )

    matchup_probabilities = probability.getProbabilties(
      query["elo_matchup"],
      independent_range
    )

    data_frame_dictionary = {
      "elo": independent_range,
      "base": matchup_probabilities
    }

    team_moniker_result_set = sql.pg_client.execute_sql(query["team_monikers"])
    team_monikers = list(zip(*team_moniker_result_set))[0]

    for moniker in team_monikers:
        team_query = query["elo_matchup_where_moniker"].replace("[moniker]", moniker)

        data_frame_dictionary[moniker] = probability.getProbabilties(
          team_query,
          independent_range
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

    plot.set(
      xlabel="Elo difference betweent teams",
      ylabel="Probability of predicting victory"
    )

    plot.get_figure().savefig("out/teams.png")
