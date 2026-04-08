import sqlite3
import os
import bcrypt

APP_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'app.db')

def get_app_db():
    conn = sqlite3.connect(APP_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_app_db():
    conn = get_app_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    UNIQUE NOT NULL,
            password TEXT    NOT NULL,
            role     TEXT    NOT NULL DEFAULT 'user'
        )
    ''')
    conn.commit()

    # Insert default accounts if they don't exist
    _add_user(conn, 'admin', 'admin123', 'admin')
    _add_user(conn, 'user',  'user123',  'user')

    conn.close()

def _add_user(conn, username, password, role):
    exists = conn.execute(
        'SELECT id FROM users WHERE username = ?', [username]
    ).fetchone()
    if not exists:
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        conn.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashed.decode(), role]
        )
        conn.commit()
        print(f'  Created user: {username} ({role})')