from flask import Flask
from flask_cors import CORS

from server.routers.hospitals import hospitals_bp
from server.routers.stats import stats_bp
from server.routers.lookup import lookup_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(hospitals_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(lookup_bp)

@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'HQE Server is running'}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)