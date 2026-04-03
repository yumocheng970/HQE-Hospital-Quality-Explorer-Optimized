from flask import Blueprint, jsonify
from server.db import get_db

lookup_bp = Blueprint('lookup', __name__)

VALID_TABLES = {
    'complications',
    'infections',
    'timely_care',
    'readmissions',
    'patient_experience',
    'payment',
}

# ── GET /api/lookup/measures/<table> ────────────────────────
@lookup_bp.route('/api/lookup/measures/<table>', methods=['GET'])
def lookup_measures(table):
    if table not in VALID_TABLES:
        return jsonify({'error': f'Unknown table: {table}'}), 400

    db = get_db()

    # patient_experience 用 hcahps_measure_id
    if table == 'patient_experience':
        rows = db.execute("""
            SELECT DISTINCT hcahps_measure_id AS measure_id,
                            hcahps_question   AS measure_name
            FROM patient_experience
            ORDER BY hcahps_measure_id
        """).fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])

    # readmissions has no measure_id, use measure_name as unique identifier
    if table == 'readmissions':
        rows = db.execute("""
            SELECT DISTINCT measure_name
            FROM readmissions
            ORDER BY measure_name
        """).fetchall()
        db.close()
        return jsonify([{'measure_id': None, 'measure_name': r['measure_name']} for r in rows])

    # complications, infections, timely_care, payment
    rows = db.execute(f"""
        SELECT DISTINCT measure_id, measure_name
        FROM {table}
        ORDER BY measure_id
    """).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])