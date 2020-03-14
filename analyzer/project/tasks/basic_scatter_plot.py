import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd


import project.sql as sql


query = {
  "elo_matchup": sql.file("elo_matchup"),
}


def execute():
    result_set = sql.pg_client.execute_sql(query["elo_matchup"])

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

    plot.savefig("out/basic-scatter-plot.png")
