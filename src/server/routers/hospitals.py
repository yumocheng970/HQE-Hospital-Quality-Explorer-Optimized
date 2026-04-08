from flask import Blueprint, request, jsonify
from server.db import get_db

hospitals_bp = Blueprint('hospitals', __name__)


# ── GET /api/hospitals ───────────────────────────────────────
@hospitals_bp.route('/api/hospitals', methods=['GET'])
def list_hospitals():
    name   = request.args.get('name', '').strip()
    state  = request.args.get('state', '').strip()
    city   = request.args.get('city', '').strip()
    h_type = request.args.get('type', '').strip()
    rating = request.args.get('rating', '').strip()

    sql    = "SELECT * FROM hospitals WHERE 1=1"
    params = []

    if name:
        sql += " AND facility_name LIKE ?"
        params.append(f"%{name}%")
    if state:
        sql += " AND state = ?"
        params.append(state.upper())
    if city:
        sql += " AND city_town LIKE ?"
        params.append(f"%{city}%")
    if h_type:
        sql += " AND hospital_type = ?"
        params.append(h_type)
    if rating:
        sql += " AND hospital_overall_rating = ?"
        params.append(rating)

    sql += " LIMIT 50"

    db   = get_db()
    rows = db.execute(sql, params).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])


# ── GET /api/hospitals/map ───────────────────────────────────
@hospitals_bp.route('/api/hospitals/map', methods=['GET'])
def map_hospitals():
    state = request.args.get('state', '').strip()

    sql    = """
        SELECT facility_id, facility_name, lat, lon, hospital_overall_rating
        FROM hospitals
        WHERE lat IS NOT NULL AND lon IS NOT NULL
    """
    params = []

    if state:
        sql += " AND state = ?"
        params.append(state.upper())

    db   = get_db()
    rows = db.execute(sql, params).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])


# ── GET /api/hospitals/states ────────────────────────────────
@hospitals_bp.route('/api/hospitals/states', methods=['GET'])
def list_states():
    db   = get_db()
    rows = db.execute(
        "SELECT state, COUNT(*) as count FROM hospitals GROUP BY state ORDER BY state"
    ).fetchall()
    db.close()

    return jsonify({"data": [dict(r) for r in rows]})


# ── GET /api/hospitals/<facility_id> ─────────────────────────
@hospitals_bp.route('/api/hospitals/<facility_id>', methods=['GET'])
def get_hospital(facility_id):
    db       = get_db()
    hospital = db.execute(
        "SELECT * FROM hospitals WHERE facility_id = ?", [facility_id]
    ).fetchone()

    if not hospital:
        db.close()
        return jsonify({'error': 'Not found'}), 404

    result = dict(hospital)
    result['complications']      = _fetch(db, 'complications',      facility_id)
    result['infections']         = _fetch(db, 'infections',         facility_id)
    result['readmissions']       = _fetch(db, 'readmissions',       facility_id)
    result['patient_experience'] = _fetch(db, 'patient_experience', facility_id)
    result['timely_care']        = _fetch(db, 'timely_care',        facility_id)
    result['payment']            = _fetch(db, 'payment',            facility_id)

    db.close()
    return jsonify(result)


# ── INTERNAL UTILITIES ─────────────────────────────────────
TABLE_COLUMNS = {
    'complications':      'measure_id, measure_name, score, lower_estimate, higher_estimate, compared_to_national, start_date, end_date',
    'infections':         'measure_id, measure_name, score, compared_to_national, start_date, end_date',
    'readmissions':       'measure_name, excess_readmission_ratio, predicted_readmission_rate, expected_readmission_rate, number_of_readmissions, start_date, end_date',
    'patient_experience': 'hcahps_measure_id, hcahps_question, hcahps_answer_description, hcahps_answer_percent, patient_survey_star_rating, start_date, end_date',
    'timely_care':        'condition, measure_id, measure_name, score, start_date, end_date',
    'payment':            'payment_measure_id, payment_measure_name, payment_category, payment, lower_estimate, higher_estimate, start_date, end_date',
}

def _fetch(db, table, facility_id):
    cols = TABLE_COLUMNS.get(table, '*')
    rows = db.execute(
        f"SELECT {cols} FROM {table} WHERE CAST(facility_id AS TEXT) = CAST(? AS TEXT)",
        [facility_id]
    ).fetchall()
    return [dict(r) for r in rows]