import seaborn as sns
import matplotlib.pyplot as plt

import project.tasks.home_field as home_field
import project.tasks.teams as teams
import project.tasks.basic_scatter_plot as basic_scatter_plot

sns.set(font_scale=1.25)
fig, ax = plt.subplots()

sns.set_style("white", {
  "font.sans-serif": [
    "BalooChettan2-Regular.ttf", "Comic Sans", "Helvetica", "Arial"
  ],
  "axes.spines.left": False,
  "axes.spines.bottom": False,
  "axes.spines.right": False,
  "axes.spines.top": False,
})

home_field.execute()
teams.execute()
basic_scatter_plot.execute()
