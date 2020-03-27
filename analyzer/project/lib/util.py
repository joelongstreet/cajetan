import project.sql.pg_client as pg_client


def build_list_from_sql(base_query, interpolation_args={}):
    response = _build_and_execute_sql(base_query, interpolation_args)
    return list(
      zip(*response)
    )[0]


def build_list_and_tuples_from_sql(base_query, interpolation_args={}):
    response = _build_and_execute_sql(base_query, interpolation_args)

    dependent_list, independent_list = zip(*response)

    independent_tuple_set = list(
      zip(independent_list)
    ),

    return dependent_list, independent_tuple_set[0]


def build_tuples_and_tuples_from_sql(base_query, interpolation_args={}):
    response = _build_and_execute_sql(base_query, interpolation_args)

    tuples_lists = list(
      zip(*response)
    )

    return tuples_lists[0], tuples_lists[1]


def _build_and_execute_sql(base_query, interpolation_args={}):
    return pg_client.build_and_execute_sql(
      base_query,
      interpolation_args
    )
