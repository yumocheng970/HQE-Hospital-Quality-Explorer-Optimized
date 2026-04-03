from flask import Blueprint, request, jsonify
from server.db import get_db

stats_bp = Blueprint('stats', __name__)

VALID_TABLES = {
    'complications',
    'infections',
    'timely_care',
    'readmissions',
    'patient_experience',
    'payment',
}

# ── GET /api/stats/ratings-by-state ─────────────────────────
@stats_bp.route('/api/stats/ratings-by-state', methods=['GET'])
def ratings_by_state():
    db = get_db()
    rows = db.execute("""
        SELECT state, hospital_overall_rating AS rating, COUNT(*) AS count
        FROM hospitals
        WHERE hospital_overall_rating NOT IN ('Not Available', '')
          AND hospital_overall_rating IS NOT NULL
        GROUP BY state, hospital_overall_rating
        ORDER BY state, rating
    """).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# ── GET /api/stats/measures/<table> ─────────────────────────
@stats_bp.route('/api/stats/measures/<table>', methods=['GET'])
def measures_stats(table):
    if table not in VALID_TABLES:
        return jsonify({'error': f'Unknown table: {table}'}), 400

    facility_id = request.args.get('facility_id', '').strip()
    measure_id  = request.args.get('measure_id', '').strip()

    db = get_db()

    # patient_experience has different field names, handle separately
    if table == 'patient_experience':
        sql    = "SELECT * FROM patient_experience WHERE 1=1"
        params = []
        if facility_id:
            sql += " AND CAST(facility_id AS TEXT) = CAST(? AS TEXT)"
            params.append(facility_id)
        if measure_id:
            sql += " AND hcahps_measure_id = ?"
            params.append(measure_id)
        rows = db.execute(sql, params).fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])

    # readmissions has no measure_id, handle separately
    if table == 'readmissions':
        sql    = "SELECT * FROM readmissions WHERE 1=1"
        params = []
        if facility_id:
            sql += " AND CAST(facility_id AS TEXT) = CAST(? AS TEXT)"
            params.append(facility_id)
        rows = db.execute(sql, params).fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])

    # complications / infections / timely_care / payment
    sql    = f"SELECT * FROM {table} WHERE 1=1"
    params = []
    if facility_id:
        sql += " AND CAST(facility_id AS TEXT) = CAST(? AS TEXT)"
        params.append(facility_id)
    if measure_id:
        sql += " AND measure_id = ?"
        params.append(measure_id)

    rows = db.execute(sql, params).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])