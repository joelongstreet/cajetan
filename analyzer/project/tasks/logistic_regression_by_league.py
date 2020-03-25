import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd


import project.sql as sql


query = {
  "league": sql.file("league"),
  "elo_matchup": sql.file("elo_matchup"),
}


def execute():
    leagues = sql.pg_client.execute_sql(
      query["league"]
    )[0][0].replace("{", "").replace("}", "").split(",")

    for league in leagues:
        _plot_and_draw(league)


def _plot_and_draw(league):
    result_set = sql.pg_client.execute_sql(
      query["elo_matchup"],
      {
        'league': league
      }
    )

    data_frame = pd.DataFrame({
      'ELO': list(zip(*result_set))[1],
      'Probability': list(zip(*result_set))[0],
    })

    plt.figure(figsize=(12, 12))

    plot = sns.lmplot(
      x="ELO",
      y="value",
      y_jitter=.1,
      logistic=True,
      size=12,
      scatter_kws={"s": 10},
      data=pd.melt(
        data_frame, ['ELO']
      )
    )

    plot.savefig("out/logistic-regression-%s.png" % league)
