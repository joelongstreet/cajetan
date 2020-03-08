import seaborn as sns
import pandas as pd

import sql_queries
import probability


base_elo_query  = sql_queries.queries["basic"]
base_elo_stats  = probability.getProbabiltySetFromQuery(base_elo_query)

df = pd.DataFrame({
  'ELO': base_elo_stats["range"],
  'Probability': base_elo_stats["probabilties"]
})

plot = sns.lineplot(x="ELO", y="value", data=pd.melt(df, ['ELO']))
plot.set(xlabel="Elo Difference betweent teams", ylabel="Probability of Predicting Victory")
sns.despine(offset=5)

fig = plot.get_figure()
fig.savefig("output.png")