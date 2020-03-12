from sklearn.linear_model import LogisticRegression

import numpy as np
import project.sql.pg_client as pg_client


def getIndependentRange(query):
    sql_response = pg_client.execute_sql(query)
    independent = list(
      zip(*sql_response)
    )[0]

    independent_range = range(
      min(independent), max(independent)
    )

    return independent_range


def getProbabilties(query, independent_range):
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
