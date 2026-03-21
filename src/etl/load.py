import requests
import pandas as pd
import sqlite3
import os
import io

# ── 输出路径 ──────────────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'hospital_quality.db')

# ── CMS 数据集 ID ─────────────────────────────────────────
DATASETS = {
    'hospitals':          'xubh-q36u',
    'complications':      'ynj2-r877',
    'infections':         '77hc-ibv8',
    'readmissions':       '9n3s-kdb3',
    'patient_experience': 'dgck-syfz',
    'timely_care':        'yv7e-xc69',
    'payment':            'c7us-v4mf',
}

BASE_URL = 'https://data.cms.gov/provider-data/api/1/datastore/query/{}/0/download?format=csv'

NULL_STRINGS = ['Not Available', 'N/A', 'Not Applicable', '-', '']

def fetch_dataset(dataset_id: str) -> pd.DataFrame:
    url = BASE_URL.format(dataset_id)
    print(f'  下载 {url}...')
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    df = pd.read_csv(io.StringIO(resp.text))
    print(f'  完成，共 {len(df)} 行')
    return df

def clean(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(' ', '_')
        .str.replace(r'[^\w]', '_', regex=True)
    )
    df = df.replace(NULL_STRINGS, None)
    df = df.where(df.notna(), None)
    return df

def load(df: pd.DataFrame, table: str, conn: sqlite3.Connection):
    df.to_sql(table, conn, if_exists='replace', index=False)
    print(f'  写入 {table}：{len(df)} 行')

def add_indexes(conn: sqlite3.Connection):
    cur = conn.cursor()
    for t in ['hospitals', 'complications', 'infections', 'readmissions', 'patient_experience', 'timely_care', 'payment']:
        try:
            cur.execute(f'CREATE INDEX IF NOT EXISTS idx_{t}_facility ON {t}(facility_id)')
        except sqlite3.OperationalError as e:
            print(f'  索引跳过 {t}.facility_id: {e}')
    conn.commit()
    print('索引创建完成')

def main():
    print(f'数据库路径：{os.path.abspath(DB_PATH)}')
    conn = sqlite3.connect(DB_PATH)

    for table, dataset_id in DATASETS.items():
        print(f'\n── {table} ──')
        try:
            df = fetch_dataset(dataset_id)
            df = clean(df)
            load(df, table, conn)
        except Exception as e:
            print(f'  错误：{e}')

    add_indexes(conn)
    conn.close()
    print('\nETL 完成')

if __name__ == '__main__':
    main()