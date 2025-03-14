from flask import Flask, Blueprint, jsonify, request
import google.generativeai as genai
from flask_cors import CORS
from dotenv import load_dotenv
import os
import base64

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_GEMINI_API")

# Configure the Gemini API
genai.configure(api_key=api_key)

# Create the generative model
model = genai.GenerativeModel('gemini-1.5-flash')

# Define the blueprint and enable CORS
report_blueprint = Blueprint('report', __name__)
CORS(report_blueprint)

@report_blueprint.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        if not data or 'images' not in data:
            return jsonify({"error": "No images provided in request"}), 400

        images = data['images']
        if not images:
            return jsonify({"error": "Empty images array"}), 400

        analysis_results = []
        
        for idx, image_base64 in enumerate(images):
            if not image_base64:
                continue

            # Extract base64 data if it's a data URL
            if image_base64.startswith('data:'):
                image_base64 = image_base64.split(',')[1]

            # Prepare the prompt
            prompt = """
            Please analyze this chart image and provide:
            1. A description of what the chart is showing,Key insights or patterns visible in the data and
             any notable trends or outliers
            2. Potential business implications or recommendations
            Please be concise but thorough in your analysis.(100 words max)
            """

            # Create the message with both prompt and image
            image_part = {
                "mime_type": "image/jpeg",
                "data": image_base64
            }

            # Generate content using Gemini
            response = model.generate_content([
                prompt,
                image_part
            ])

            analysis_results.append(response.text)

        return jsonify({"analysis": analysis_results}), 200

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500