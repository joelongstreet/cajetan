from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import PolynomialFeatures

import numpy as np
import project.sql.pg_client as pg_client

polynomial_regression = PolynomialFeatures(degree=2)


def get_independent_range(query):
    sql_response = pg_client.execute_sql(query)
    independent = list(
      zip(*sql_response)
    )[0]

    independent_range = range(
      min(independent), max(independent)
    )

    return independent_range


def get_logistic_regression_probabilties(query, independent_range):
    sql_response = pg_client.execute_sql(query)
    dependent, independent = zip(*sql_response)

    logistic_regression = LogisticRegression(
      random_state=0
    ).fit(
      list(
        zip(independent)
      ),
      dependent
    )

    probabilties = logistic_regression.predict_proba(
      np.reshape(
        independent_range,
        (-1, 1)
      )
    )

    return list(
      zip(*probabilties)
    )[1]


def get_polynomnial_regression_probabilities(query, independent_range):
    sql_response = pg_client.execute_sql(query)
    probabilties = map(
      lambda x: _fill_blanks_with_NaN(x, sql_response), independent_range
    )

    return list(probabilties)


def _fill_blanks_with_NaN(i, dependent_range_array):
    probability = [
      item for item in dependent_range_array if item[0] == i
    ]

    if (probability):
        return probability[0][1]
    else:
        return float('NaN')
