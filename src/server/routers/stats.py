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
    # Returns the distribution of hospital star ratings grouped by state.
    # Used by the Dashboard to render the ratings bar chart.
    # Excludes rows where rating is null or 'Not Available' (CMS placeholder).
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


# ── GET /api/stats/hospital-types ───────────────────────────
@stats_bp.route('/api/stats/hospital-types', methods=['GET'])
def hospital_types():
    # Returns hospital type distribution, optionally filtered by state.
    # Used by the Dashboard to show Acute Care vs Critical Access vs other types.
    state = request.args.get('state', '').strip()

    sql    = """
        SELECT hospital_type, COUNT(*) AS count
        FROM hospitals
        WHERE hospital_type IS NOT NULL
    """
    params = []

    if state:
        sql += " AND state = ?"
        params.append(state.upper())

    sql += " GROUP BY hospital_type ORDER BY count DESC"

    db   = get_db()
    rows = db.execute(sql, params).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# ── GET /api/stats/ed-wait-times ────────────────────────────
@stats_bp.route('/api/stats/ed-wait-times', methods=['GET'])
def ed_wait_times():
    # Returns average emergency department wait times by state.
    # Only uses rows where condition = 'Emergency Department' and score is a number.
    # Used by the Dashboard to compare ED wait times across states.
    state = request.args.get('state', '').strip()

    sql    = """
        SELECT state, measure_name, ROUND(AVG(CAST(score AS REAL)), 1) AS avg_score
        FROM timely_care
        WHERE condition = 'Emergency Department'
          AND score IS NOT NULL
          AND CAST(score AS REAL) > 0
    """
    params = []

    if state:
        sql += " AND state = ?"
        params.append(state.upper())

    sql += " GROUP BY state, measure_name ORDER BY state, measure_name"

    db   = get_db()
    rows = db.execute(sql, params).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# ── GET /api/stats/measures/<table> ─────────────────────────
@stats_bp.route('/api/stats/measures/<table>', methods=['GET'])
def measures_stats(table):
    # Returns measure data from any of the six CMS quality tables.
    # Accepts optional query params:
    #   - facility_id: filter to a single hospital (used by HospitalDetailPage)
    #   - measure_id:  filter to a specific measure (not applicable for readmissions)
    #
    # The five measure tables have inconsistent schemas — this is a CMS data issue,
    # not a design choice. Each branch handles one structural difference:
    #
    #   patient_experience: uses 'hcahps_measure_id' instead of 'measure_id',
    #                       and 'hcahps_answer_percent' instead of 'score'
    #   readmissions:       has no 'measure_id' or 'score' column at all —
    #                       uses 'excess_readmission_ratio' and related fields
    #   all others:         share the same structure (measure_id, score, etc.)
    #
    # A single generic query would either crash on missing columns or require
    # awkward column aliasing. Per-table branches are more explicit and easier
    # to debug, at the cost of some repetition.

    if table not in VALID_TABLES:
        return jsonify({'error': f'Unknown table: {table}'}), 400

    facility_id = request.args.get('facility_id', '').strip()
    measure_id  = request.args.get('measure_id', '').strip()

    db = get_db()

    # patient_experience: different field names, handle separately
    if table == 'patient_experience':
        sql    = "SELECT * FROM patient_experience WHERE 1=1"
        params = []
        if facility_id:
            sql += " AND CAST(facility_id AS TEXT) = CAST(? AS TEXT)"
            params.append(facility_id)
        if measure_id:
            # patient_experience uses hcahps_measure_id, not measure_id
            sql += " AND hcahps_measure_id = ?"
            params.append(measure_id)
        rows = db.execute(sql, params).fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])

    # readmissions: no measure_id column, skip that filter
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
    # These all share the same structure: measure_id, measure_name, score
    sql    = f"SELECT * FROM {table} WHERE 1=1"
    params = []
    if facility_id:
        # facility_id is TEXT in most tables but INTEGER in readmissions/payment,
        # so we cast both sides to avoid type mismatch returning empty results
        sql += " AND CAST(facility_id AS TEXT) = CAST(? AS TEXT)"
        params.append(facility_id)
    if measure_id:
        sql += " AND measure_id = ?"
        params.append(measure_id)

    rows = db.execute(sql, params).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])