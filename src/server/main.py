from flask import Flask

app = Flask(__name__)

@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'HQE Server is running'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)