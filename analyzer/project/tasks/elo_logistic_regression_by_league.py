import seaborn as sns
import pandas as pd
import project.sql as sql
import project.lib.util as util


query = {
  "elo_matchup": sql.file("elo_matchup"),
}


def execute(league):
    probability_tuples, elo_tuples = util.build_tuples_and_tuples_from_sql(
      query["elo_matchup"],
      {"league": league}
    )

    data_frame = pd.DataFrame({
      "ELO": elo_tuples,
      "Probability": probability_tuples,
    })

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
