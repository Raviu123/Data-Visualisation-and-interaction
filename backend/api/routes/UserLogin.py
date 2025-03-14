from flask import Blueprint, jsonify, request
from flask_cors import CORS
from flask_login import login_user, current_user
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from .. import mongo, bcrypt, login_manager
from ..models import User

User_blueprint = Blueprint('UserLogin', __name__)
CORS(User_blueprint)

# Users collection
users_collection = mongo.db.users

# User Loader
@login_manager.user_loader
def load_user(user_id):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    return User(user) if user else None

@User_blueprint.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if users_collection.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = generate_password_hash(password)
    user_id = users_collection.insert_one({"email": email, "password": hashed_password}).inserted_id
    return jsonify({"message": "Signup successful", "user_id": str(user_id)}), 201

@User_blueprint.route('/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = users_collection.find_one({"email": email})
    if user and check_password_hash(user['password'], password):
        login_user(User(user))
        return jsonify({"message": "Login successful", "email": email, "user_id": str(user['_id'])}), 200
    return jsonify({"message": "Invalid email or password"}), 401
