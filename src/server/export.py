import csv
import io
from flask import Blueprint, request, Response
from server.db import get_db
from server.middleware import require_auth

export_bp = Blueprint('export', __name__)

#  GET /api/export/csv
@export_bp.route('/api/export/csv', methods=['GET'])
@require_auth
def export_csv():
    name = request.args.get('name', '').strip()
    state = request.args.get('state', '').strip()
    city = request.args.get('city', '').strip()
    h_type = request.args.get('type', '').strip()
    rating = request.args.get('rating', '').strip()

    sql = "SELECT * FROM hospitals WHERE 1=1"
    params = []
    if name:
        sql += f" AND facility_name LIKE ?"
        params.append(f"%{name}%")
    if state:
        sql += f" AND state = ?"
        params.append(state.upper())
    if city:
        sql += f" AND city = ?"
        params.append(f"%{city}%")
    if h_type:
        sql += f" AND hospital_type = ?"
        params.append(h_type)
    if rating:
        sql += f" AND hospital_overall_rating = ?"
        params.append(rating)
    
    db = get_db()
    rows = db.execute(sql, params).fetchall()
    db.close()

    #write to csv
    output = io.StringIO()
    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows([dict(r) for r in rows])

    return Response(output.getvalue(), mimetype='text/csv', headers={'Content-Disposition': 'attachment; filename="hospitals.csv"'})