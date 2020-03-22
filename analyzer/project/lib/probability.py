from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

import numpy as np
import project.sql.pg_client as pg_client


def get_independent_range(query):
    sql_response = pg_client.execute_sql(query)
    independent = list(
      zip(*sql_response)
    )[0]

    independent_range = range(
      min(independent), max(independent) + 1
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
    dependent = list(
      map(
        lambda x: _fill_blanks_with_NaN(x, sql_response), independent_range
      )
    )

    progressive_dependent = _fill_NaNs_with_linear_progression(dependent)

    polynomial_regression = PolynomialFeatures(degree=3)
    polynomial_fit = polynomial_regression.fit_transform(
      np.reshape(
        independent_range,
        (-1, 1)
      )
    )

    linear_regression = LinearRegression()
    linear_regression.fit(
      polynomial_fit,
      np.reshape(
        progressive_dependent,
        (-1, 1)
      )
    )

    probabilties = linear_regression.predict(polynomial_fit)

    return list(
      zip(*probabilties)
    )[0]


def _fill_blanks_with_NaN(i, independent_range_array):
    probability = [
      item for item in independent_range_array if item[0] == i
    ]

    if (probability):
        return probability[0][1]
    else:
        return np.nan


def _fill_NaNs_with_linear_progression(lst):
    ret = lst.copy()

    for i, d in enumerate(ret):
        if np.isfinite(d):
            continue

        previous_d = 0
        if(i > 0):
            previous_d = ret[i - 1]

        next_d = previous_d
        next_d_index = i
        for j, _k in enumerate(ret, start=i+1):
            if j >= len(lst):
                break
            if np.isfinite(ret[j]):
                next_d = ret[j]
                next_d_index = j
                break

        index_diff = next_d_index - i + 1
        d_diff = next_d - previous_d
        ret[i] = previous_d + (d_diff / index_diff)

    return ret
