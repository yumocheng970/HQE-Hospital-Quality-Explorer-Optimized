from flask import Blueprint, request, jsonify, session
from server.auth_db import get_app_db
import bcrypt

auth_bp = Blueprint('auth', __name__)

# ── POST /api/auth/login ─────────────────────────────────────
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data     = request.get_json()
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    db   = get_app_db()
    user = db.execute(
        'SELECT * FROM users WHERE username = ?', [username]
    ).fetchone()
    db.close()

    if not user or not bcrypt.checkpw(password.encode(), user['password'].encode()):
        return jsonify({'error': 'Invalid username or password'}), 401

    session['user_id'] = user['id']
    session['username'] = user['username']
    session['role']     = user['role']

    return jsonify({'id': user['id'], 'username': user['username'], 'role': user['role']})


# ── POST /api/auth/logout ────────────────────────────────────
@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})


# ── GET /api/auth/me ─────────────────────────────────────────
@auth_bp.route('/api/auth/me', methods=['GET'])
def me():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    return jsonify({
        'id':       session['user_id'],
        'username': session['username'],
        'role':     session['role']
    })