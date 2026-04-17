from flask import Blueprint, jsonify, session
from server.auth_db import get_app_db
from server.middleware import require_admin

admin_bp = Blueprint('admin', __name__)

# ── GET /api/admin/users ─────────────────────────────────────
@admin_bp.route('/api/admin/users', methods=['GET'])
@require_admin
def list_users():
    # Returns all users. Admin only.
    db   = get_app_db()
    rows = db.execute(
        'SELECT id, username, role FROM users ORDER BY id'
    ).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# ── DELETE /api/admin/users/<id> ─────────────────────────────
@admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    # Prevent admin from deleting themselves
    if user_id == session['user_id']:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    db   = get_app_db()
    user = db.execute(
        'SELECT id FROM users WHERE id = ?', [user_id]
    ).fetchone()

    if not user:
        db.close()
        return jsonify({'error': 'User not found'}), 404

    db.execute('DELETE FROM users WHERE id = ?', [user_id])
    db.commit()
    db.close()
    return jsonify({'message': f'User {user_id} deleted'})