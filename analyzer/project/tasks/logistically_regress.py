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

    plot = sns.lmplot(
      x="ELO",
      y="value",
      y_jitter=.1,
      logistic=True,
      scatter_kws={"s": 3},
      data=pd.melt(
        data_frame, ['ELO']
      )
    )

    plot.savefig("out/logistically-regress.png")
