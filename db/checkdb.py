import sqlite3
import pandas as pd

dbfile = r'C:\Users\peter.petek\Desktop\investment-game-main\db\investment.db'
con = sqlite3.connect(dbfile)
cur = con.cursor()

# Get all table names
table_list = [a[0] for a in cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]

# Load each table into a DataFrame
dataframes = {}

for table_name in table_list:
    df = pd.read_sql_query(f"SELECT * FROM {table_name}", con)
    dataframes[table_name] = df
    print(f"\n--- {table_name} ---")
    print(df)
"""
cur.execute("ALTER TABLE wealth_history DROP COLUMN stock_prices;")
con.commit()

df = pd.read_sql_query(f"SELECT * FROM {table_list[3]}", con)
dataframes[table_list[3]] = df
print(f"\n--- {table_list[3]} ---")
print(df)
"""

con.close()