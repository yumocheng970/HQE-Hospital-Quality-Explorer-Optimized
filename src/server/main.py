from flask import Flask
from flask_cors import CORS
import os
from server.routers.hospitals import hospitals_bp
from server.routers.stats import stats_bp
from server.routers.lookup import lookup_bp
from server.routers.auth import auth_bp
from server.auth_db import init_app_db
from server.export import export_bp

app = Flask(__name__)
app.secret_key = os.environ.get('SESSION_SECRET', 'dev_secret_change-in-production')
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

app.register_blueprint(hospitals_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(lookup_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(export_bp)

with app.app_context():
    init_app_db()

@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'HQE Server is running'}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)