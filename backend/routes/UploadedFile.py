from flask import Flask, Blueprint, request, jsonify
import pandas as pd 
import os
from flask_cors import CORS

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
        return jsonify({"error": "no selected file"}), 400
    
    try:
        # Save file
        filename = file.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Verify file can be read
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(filepath)
        else:
            return jsonify({'error': 'Unsupported file type, only csv and excel are allowed'}), 400
        
        print(f"File successfully saved to: {filepath}")  # Debug print
        return jsonify({'success': True, 'filename': filename}), 200
    
    except Exception as e:
        print(f"Error in upload_file: {str(e)}")  # Debug print
        return jsonify({'error': str(e)}), 500