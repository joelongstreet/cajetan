import argparse
import sys
import seaborn as sns
import matplotlib.pyplot as plt

from project.tasks import *

parser = argparse.ArgumentParser(
  description='Run analysis on ELO and Moneyline data'
)
parser.add_argument(
  '-l',
  '--league',
  required=True,
  action='append',
  help='The leagues to analyze. Can be one or more of the following: NFL, NBA, NHL, MLB. Specify multiple --league arguments to work multiple leagues.'
)
parser.add_argument(
  '-t',
  '--task',
  required=True,
  action='append',
  help='The tasks to run. Can be one or more files within analyzer/project/tasks. Specify multiple --task arguments to execute multiple tasks.'
)

sns.set(font_scale=1.25)
fig, ax = plt.subplots()
plt.figure(figsize=(12, 12))

sns.set_style("white", {
  "font.sans-serif": [
    "BalooChettan2-Regular.ttf", "Comic Sans", "Helvetica", "Arial"
  ],
  "axes.spines.left": False,
  "axes.spines.bottom": False,
  "axes.spines.right": False,
  "axes.spines.top": False,
})


arguments = parser.parse_args()
for league in arguments.league:
    for task in arguments.task:
        getattr(sys.modules[__name__], task).execute(league)
