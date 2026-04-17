from flask import Flask, send_from_directory
from flask_cors import CORS
import os

from server.routers.hospitals import hospitals_bp
from server.routers.stats     import stats_bp
from server.routers.lookup    import lookup_bp
from server.routers.auth      import auth_bp
from server.export            import export_bp
from server.auth_db           import init_app_db
from server.routers.admin     import admin_bp

CLIENT_DIST = os.path.join(os.path.dirname(__file__), '..', 'client', 'dist')

app = Flask(__name__)
app.secret_key = os.environ.get('SESSION_SECRET', 'dev-secret-change-in-prod')
CORS(app, supports_credentials=True)

app.register_blueprint(hospitals_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(lookup_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(export_bp)
app.register_blueprint(admin_bp)

with app.app_context():
    init_app_db()

@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'HQE Server is running'}

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api/'):
        return {'error': 'Not found'}, 404
    asset_path = os.path.join(CLIENT_DIST, path)
    if path and os.path.isfile(asset_path):
        return send_from_directory(CLIENT_DIST, path)
    return send_from_directory(CLIENT_DIST, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)