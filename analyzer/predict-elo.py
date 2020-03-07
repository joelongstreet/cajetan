from sklearn.linear_model import LogisticRegression

import pg_client
import sql_queries

sql_response = pg_client.execute_sql(sql_queries.elo_diff)

elo_predicted_outcome, elo_diff = zip(*sql_response)

dependent_variable   = elo_predicted_outcome
independent_variable = list(zip(elo_diff))

clf = LogisticRegression(random_state=0).fit(independent_variable, dependent_variable)

hi_probability      = clf.predict_proba([[400, ]])
mid_hi_probability  = clf.predict_proba([[300, ]])
mid_lo_probability  = clf.predict_proba([[200, ]])
lo_probability      = clf.predict_proba([[100, ]])

print(hi_probability)
print(mid_hi_probability)
print(mid_lo_probability)
print(lo_probability)

print(clf.score(independent_variable, dependent_variable))
