import os
import pandas as pd
from pandasai import SmartDataframe
from langchain_community.llms import Ollama

from langchain_google_genai import ChatGoogleGenerativeAI

from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from bson.objectid import ObjectId
from .. import mongo
import numbers
import gridfs
import io

# -----------------------------
# Using Mistral with Ollama
# -----------------------------
#llm = Ollama(model="mistral")  # Load Mistral via Ollama

# -----------------------------
# Gemini Configuration (Commented Out)
# -----------------------------
import google.generativeai as genai
# from pandasai.llm.google_gemini import GoogleGemini
GEMINI_API_KEY = "AIzaSyDjv8OplGguDN70fLE3ljKrEeTX9-16X78"
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY  # Optional
genai.configure(api_key=GEMINI_API_KEY)

# llm = GoogleGemini(api_key=GEMINI_API_KEY)
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
# Flask blueprint and CORS setup
chat_blueprint = Blueprint('chat', __name__)
CORS(chat_blueprint, supports_credentials=True, resources={
    r"/insights/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

def process_response(result):
    try:
        if isinstance(result, str):
            return jsonify({"type": "text", "content": result, "success": True})

        elif isinstance(result, pd.DataFrame):
            data = result.to_dict(orient="records")
            return jsonify({"type": "table", "data": data, "success": True})
        elif isinstance(result, (int, float)):
            return jsonify({"type": "text", "content": str(result), "success": True})
        elif isinstance(result, numbers.Real):
            return jsonify({"type": "text", "content": str(result), "success": True})
        else:
            return jsonify({"type": "error", "message": "Unsupported response type.", "success": False})
    except Exception as e:
        return jsonify({"type": "error", "message": str(e), "success": False})

@chat_blueprint.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        data_id = data.get("data_id")
        user_query = data.get("message")
        if not data_id or not user_query:
            return jsonify({"success": False, "error": "Missing data_id or message"}), 400

        print(f"Received query: {user_query} for data ID: {data_id}")
        
        #----------retreving file form mongoDB --- old way--------
        #file_data = mongo.db.files.find_one({"_id": ObjectId(data_id)})
        #if not file_data:
            #return jsonify({"error": f"File with ID {data_id} not found"}), 404

        # Load data into a DataFrame
        #df = pd.DataFrame(file_data["data"])
        #print(f"Successfully loaded file with {len(df)} rows") 

        # Wrap the DataFrame with SmartDataframe

         # Initialize GridFS
        fs = gridfs.GridFS(mongo.db)
        
        # Retrieve file metadata
        metadata = mongo.db.file_metadata.find_one({"file_id": data_id})
        if not metadata:
            return jsonify({"error": f"File with ID {data_id} not found"}), 404

        # Retrieve file from GridFS
        file_record = fs.get(ObjectId(data_id))
        file_content = file_record.read()
        
        # Convert to DataFrame based on file type
        if metadata['file_type'] == '.csv':
            df = pd.read_csv(io.BytesIO(file_content))
        elif metadata['file_type'] in ['.xls', '.xlsx']:
            df = pd.read_excel(io.BytesIO(file_content))
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        print(f"Successfully loaded file with {len(df)} rows")

        sdf = SmartDataframe(df, config={"llm": llm})

        # Run a query
        result = sdf.chat(user_query)
        print("Result:", result) 
        return process_response(result)
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@chat_blueprint.route("/datatable", methods=["POST"])
def datatable():
    try:
        data = request.json
        data_id = data.get("data_id")
        if not data_id:
            return jsonify({"success": False, "error": "Missing data_id"}), 400

        print(f"Received request for data table with ID: {data_id}")

        # Initialize GridFS
        fs = gridfs.GridFS(mongo.db)
        
        # Retrieve file metadata
        metadata = mongo.db.file_metadata.find_one({"file_id": data_id})
        if not metadata:
            return jsonify({"error": f"File with ID {data_id} not found"}), 404

        # Retrieve file from GridFS
        file_record = fs.get(ObjectId(data_id))
        file_content = file_record.read()
        
        # Convert to DataFrame based on file type
        if metadata['file_type'] == '.csv':
            df = pd.read_csv(io.BytesIO(file_content))
        elif metadata['file_type'] in ['.xls', '.xlsx']:
            df = pd.read_excel(io.BytesIO(file_content))
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        print(f"Successfully loaded file with {len(df)} rows") 

        # Limit the number of rows to 100
        limited_df = df.head(100)

        return jsonify({"data": limited_df.to_dict(orient="records"), "success": True})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
