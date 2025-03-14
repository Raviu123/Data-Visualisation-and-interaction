from flask import Flask
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

mongo = PyMongo()
bcrypt = Bcrypt()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] =100 * 1024 * 1024  # 10MB limit
    app.config["SECRET_KEY"] = "supersecretkey"
    app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"

    # Initialize extensions
    mongo.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "UserLogin.signin"

    # Enable CORS
    CORS(app , supports_credentials=True)

    # Register Blueprints
    from .routes.UserLogin import User_blueprint
    from .routes.UploadedFile import Upload_blueprint
    from .routes.visualizations import visualization_blueprint
    from .routes.ChatWithData import chat_blueprint
    from .routes.report import report_blueprint

    app.register_blueprint(User_blueprint, url_prefix='/user')
    app.register_blueprint(Upload_blueprint, url_prefix='/upload')
    app.register_blueprint(visualization_blueprint, url_prefix='/visualizations')
    app.register_blueprint(chat_blueprint, url_prefix='/insights')
    app.register_blueprint(report_blueprint, url_prefix='/report')  # Changed from '/chartanalysis' to '/report'

    return app
