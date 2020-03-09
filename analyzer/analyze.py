import seaborn as sns
import pandas as pd

import sql_queries
import pg_client
import probability


base_elo_query = sql_queries.queries["basic"]
base_elo_probability_set = probability.getProbabiltySetFromQuery(
  base_elo_query
)
base_elo_result_set = pg_client.execute_sql(base_elo_query)

line_plot_data_frame = pd.DataFrame({
  'ELO': base_elo_probability_set["range"],
  'Probability': base_elo_probability_set["probabilties"]
})

lm_plot_data_frame = pd.DataFrame({
  'ELO': list(zip(*base_elo_result_set))[1],
  'Probability': list(zip(*base_elo_result_set))[0]
})

line_plot = sns.lineplot(
  x="ELO",
  y="value",
  data=pd.melt(
    line_plot_data_frame, ['ELO']
  )
)
line_plot.set(
  xlabel="Elo Difference betweent teams",
  ylabel="Probability of Predicting Victory"
)
line_plot.get_figure().savefig("line_plot.png")

lm_plot = sns.lmplot(
  x="ELO",
  y="value",
  y_jitter=.1,
  logistic=True,
  scatter_kws={"s": 3},
  data=pd.melt(
    lm_plot_data_frame, ['ELO']
  )
)
lm_plot.savefig("lm_plot.png")
