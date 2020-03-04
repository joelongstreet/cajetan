import psycopg2

connection = psycopg2.connect(user="postgres",
                              host="127.0.0.1",
                              port="54320",
                              database="postgres")

def execute_sql(query):
  cursor = connection.cursor()
  cursor.execute(query)
  results = cursor.fetchall()
  cursor.close()
  return results
