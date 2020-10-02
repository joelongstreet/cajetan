from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

import numpy as np


def get_independent_range(independent_list):
    independent_range = range(
      min(independent_list), max(independent_list) + 1
    )

    return independent_range


def get_logistic_regression_probabilties(dependent_list, independent_tuples, independent_range):
    logistic_regression = LogisticRegression(
      random_state=0
    ).fit(
      independent_tuples,
      dependent_list
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


def get_polynomnial_regression_probabilities(dependent_tuples, independent_tuples, independent_range):
    tuples = list(
      zip(dependent_tuples, independent_tuples)
    )

    # trim the tuple set to remove the first 3 and last 3 elements
    # prevents wild swinging of graph elements
    trimmed_tuples = tuples[:len(tuples) - 3][3:]

    dependent = list(
      map(
        lambda x: _fill_blanks_with_NaN(x, trimmed_tuples), independent_range
      )
    )

    progressive_dependent = _fill_NaNs_with_linear_progression(dependent)

    polynomial_regression = PolynomialFeatures(degree=2)
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
