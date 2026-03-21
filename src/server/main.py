from flask import Flask
from flask_cors import CORS

from server.routers.hospitals import hospitals_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(hospitals_bp)


@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'HQE Server is running'}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)