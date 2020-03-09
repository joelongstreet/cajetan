from sklearn.linear_model import LogisticRegression

import numpy as np
import pg_client


def getProbabiltySetFromQuery(query):
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

    independent_range = range(
      -1 * max(independent), max(independent)
    )

    probabilties = logistic_regression.predict_proba(
      np.reshape(
        independent_range,
        (-1, 1)
      )
    )

    return {
      "range": independent_range,
      "probabilties": list(
        zip(*probabilties)
      )[1]
    }
