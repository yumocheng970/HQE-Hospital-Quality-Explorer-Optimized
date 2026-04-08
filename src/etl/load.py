import requests
import pandas as pd
import sqlite3
import os
import io

#  Output Path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'hospital_quality.db')

#  CMS DateSets ID
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
ZIP_URL  = 'https://raw.githubusercontent.com/midwire/free_zipcode_data/master/all_us_zipcodes.csv'

NULL_STRINGS = ['Not Available', 'N/A', 'Not Applicable', '-', '']

def fetch_dataset(dataset_id: str) -> pd.DataFrame:
    url = BASE_URL.format(dataset_id)
    print(f'  Downloading {url}...')
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    df = pd.read_csv(io.StringIO(resp.text))
    print(f'  Done, {len(df)} rows')
    return df

def fetch_zipcode_latlon() -> pd.DataFrame:
    print('\nDownloading zipcode lat/lon data...')
    resp = requests.get(ZIP_URL, timeout=60)
    resp.raise_for_status()
    df = pd.read_csv(io.StringIO(resp.text), dtype={'code': str})
    df = df[['code', 'lat', 'lon']].dropna()
    df['code'] = df['code'].str.zfill(5)
    print(f'  Done, {len(df)} zipcodes')
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

def add_latlon(hospitals: pd.DataFrame, zipcodes: pd.DataFrame) -> pd.DataFrame:
    hospitals['zip_str'] = hospitals['zip_code'].astype(str).str.zfill(5).str[:5]
    merged = hospitals.merge(zipcodes, left_on='zip_str', right_on='code', how='left')
    merged = merged.drop(columns=['zip_str', 'code'])
    matched = merged['lat'].notna().sum()
    print(f'  Geocoded {matched}/{len(merged)} hospitals via zipcode')
    return merged

def load(df: pd.DataFrame, table: str, conn: sqlite3.Connection):
    df.to_sql(table, conn, if_exists='replace', index=False)
    print(f'  Loaded {table}: {len(df)} rows')

def add_indexes(conn: sqlite3.Connection):
    cur = conn.cursor()
    for t in ['hospitals', 'complications', 'infections', 'readmissions', 'patient_experience', 'timely_care', 'payment']:
        try:
            cur.execute(f'CREATE INDEX IF NOT EXISTS idx_{t}_facility ON {t}(facility_id)')
        except sqlite3.OperationalError as e:
            print(f'  Skipped index {t}.facility_id: {e}')
    conn.commit()
    print('Indexes created')

def main():
    print(f'Database path: {os.path.abspath(DB_PATH)}')
    conn = sqlite3.connect(DB_PATH)

    zipcodes = fetch_zipcode_latlon()

    for table, dataset_id in DATASETS.items():
        print(f'\n{table}')
        try:
            df = fetch_dataset(dataset_id)
            df = clean(df)
            if table == 'hospitals':
                df = add_latlon(df, zipcodes)
            load(df, table, conn)
        except Exception as e:
            print(f'  Error: {e}')

    add_indexes(conn)
    conn.close()
    print('\nETL Done')

if __name__ == '__main__':
    main()