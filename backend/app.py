from flask import Flask
from routes.visualizations import visualization_blueprint
from routes.UploadedFile import Upload_blueprint
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

app.register_blueprint(visualization_blueprint, url_prefix='/visualizations')
app.register_blueprint(Upload_blueprint, url_prefix='/upload')

@app.route('/')
def home():
    return "working"

if __name__ == '__main__':
    app.run(debug=True)
