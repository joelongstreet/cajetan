import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

connection = psycopg2.connect(user=os.getenv("DB_USER"),
                              host=os.getenv("DB_HOST"),
                              port=os.getenv("DB_PORT"),
                              database=os.getenv("DB_DATABASE"))


def execute_sql(query, interpolation_args={}):
    built_query = query.format(**interpolation_args)

    print(built_query)

    cursor = connection.cursor()
    cursor.execute(built_query)
    results = cursor.fetchall()
    cursor.close()
    return results
