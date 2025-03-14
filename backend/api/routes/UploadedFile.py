from flask import Flask, Blueprint, request, jsonify
import pandas as pd 
import os
from flask_cors import CORS
from .. import mongo

import gridfs 
import io

Upload_blueprint = Blueprint('UploadedFile', __name__)
CORS(Upload_blueprint)

# Define uploads folder relative to the current directory
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@Upload_blueprint.route('/files', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    user_id = request.headers.get('user-id')

    try:
        # Initialize GridFS
        fs = gridfs.GridFS(mongo.db)

        # Read file content
        file_content = file.read()
        
        # Determine file type
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        # Validate file type
        if file_extension not in ['.csv', '.xls', '.xlsx']:
            return jsonify({'error': 'Unsupported file type, only CSV and Excel are allowed'}), 400

        # Store file in GridFS
        file_id = fs.put(
            file_content, 
            filename=file.filename, 
            content_type=file_extension,
            user_id=user_id,
            uploaded_at=pd.Timestamp.now()
        )

        # Optional: If you still want to store metadata separately
        metadata = {
            "file_id": str(file_id),
            "filename": file.filename,
            "user_id": user_id,
            "uploaded_at": pd.Timestamp.now(),
            "file_type": file_extension
        }
        
        # Store metadata in a separate collection
        mongo.db.file_metadata.insert_one(metadata)

        return jsonify({'success': True, 'file_id': str(file_id)}), 200

    except Exception as e:
        print(f"Error in upload_file: {str(e)}")  # Debug print
        return jsonify({'error': str(e)}), 500
    

@Upload_blueprint.route('/user-files/<user_id>', methods=['GET'])
def get_user_files(user_id):
    try:
        # Query file metadata collection for user's files
        user_files = mongo.db.file_metadata.find(
            {"user_id": user_id},
            {"file_id": 1, "filename": 1, "uploaded_at": 1, "_id": 0}
        ).sort("uploaded_at", -1)  # Sort by upload date, newest first

        # Convert cursor to list and format dates
        files_list = [{
            "file_id": file["file_id"],
            "filename": file["filename"],
            "uploaded_at": file["uploaded_at"].strftime("%Y-%m-%d %H:%M:%S")
        } for file in user_files]

        return jsonify({"files": files_list}), 200

    except Exception as e:
        print(f"Error fetching user files: {str(e)}")
        return jsonify({"error": str(e)}), 500


