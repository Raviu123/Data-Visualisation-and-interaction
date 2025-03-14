from flask import Flask,Blueprint, jsonify, request
#from services.llm_services import predict_visualizations
import pandas as pd 
import requests
import json
import os
import google.generativeai as genai
from bson.objectid import ObjectId
from .. import mongo
from dotenv import load_dotenv

import gridfs
import io

load_dotenv()

api_key = os.getenv("GOOGLE_GEMINI_API")

# Configure the Gemini API
genai.configure(api_key=api_key)
    
    # Create the generative model
model = genai.GenerativeModel('gemini-1.5-flash')

visualization_blueprint = Blueprint('visualizations',__name__)

#uploads = os.path.join(os.getcwd(), 'backend', 'uploads') #defining the upload folder path-----------for now we are going to retreve data from here,later shift to database

#load the csv from the data folder
#csv_path = os.path.abspath("../data/sample_data/sales_data.csv")
#df = pd.read_csv(csv_path)
#schema = [{"name": col, "type": str(df[col].dtype)} for col in df.columns]


def recommend_visualizations(schema):
    # Format the prompt string based on the schema
    prompt_columns = [f"{col['name']} ({col['type']})" for col in schema]
    prompt = f"""
    The dataset has the following columns: {', '.join(prompt_columns)}. 
    Suggest at least 4-6 data visualization types that would be most suitable for exploring and understanding this dataset. 
    For each visualization, provide:
    1. Chart type
    2. Columns to be used
    3. Potential insights

    suggest exactly 2 bar and 2 pie charts and 2 line chart
    include atleast 1 pie chart but should have only one column for pie chart,(it need not be numeric, string colums are also fine if they would make a good pie chart)
    IMPORTANT:give the column names exactly as they are. NO ADDING ANYTHING EXTRA!!
    IMPORTANT: do not include trailing commas in lists or JSON objects.
    IMPORTANT: if y_column is average give y_col_type:"Avg" if sum "sum"
    IMPORTANT: Respond ONLY in the exact JSON format specified:
    {{
        "visualizations": [
            {{
                "chart_type": "...",
                "columns": ["...", "..."],
                "insights": "...",
                "y_col_type":"..."
            }},
            ...
        ]
    }}
    """
    
    
    
    # Generate content
    try:
        response = model.generate_content(prompt)
        print("Full Gemini Response:", response.text)  # Debug print
        
        # Try to extract JSON from the response text
        # Look for text between first { and last }
        import re
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        
        if json_match:
            json_str = json_match.group(0)
            parsed_response = json.loads(json_str)
            return parsed_response
        else:
            print("No valid JSON found in the response")
            return {"visualizations": []}
    
    except Exception as e:
        print(f"Error in Gemini API call: {e}")
        return {"visualizations": []}




#---------------------------------added (below)-------------------------------
def create_chart_configs(recommendation, df):
    """
    Generate chart configurations based on LLM recommendation and DataFrame
    """
    chart_configs = []

    for viz in recommendation['visualizations']:
        chart_type = viz['chart_type']
        columns = viz['columns']

        try:
            # Identify numeric and categorical columns
            numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns
            categorical_columns = df.select_dtypes(include=['object']).columns

            # Handle different chart types
            if chart_type == 'Bar Chart':
                # Validate column requirements
                if len(columns) < 2:
                    print(f"Insufficient columns for {chart_type}. Need at least 2 columns.")
                    continue
                
                # Explicitly identify x and y axis columns
                x_column = columns[0]  # First column for x-axis (usually categorical)
                y_column = columns[1]  # Second column for y-axis (numeric)

                # Verify y_column is numeric
                if y_column not in numeric_columns:
                    print(f"Selected y-column {y_column} is not numeric.")
                    continue

                # Group by x-axis column and aggregate y-axis column
                # Using sum by default, but you can change aggregation method if needed
                #grouped_data = df.groupby(x_column)[y_column].sum().reset_index()
                if viz['y_col_type'] == 'Avg':
                    grouped_data = df.groupby(x_column)[y_column].mean().reset_index()
                else:
                    grouped_data = df.groupby(x_column)[y_column].sum().reset_index()
                    
                config = {
                    'chart_type': 'Bar',
                    'data': {
                        'labels': grouped_data[x_column].tolist(),
                        'datasets': [{
                            'label': y_column,
                            'data': grouped_data[y_column].tolist(),
                            'backgroundColor': 'rgba(54, 162, 235, 0.2)','rgba(255, 0, 0, 0.6)'
                            'borderColor': 'rgba(54, 162, 235, 1)',
                            'borderWidth': 1
                        }]
                    },
                    'options': {
                        'indexAxis': 'x',
                        'scales': {
                            'y': {
                                'beginAtZero': True,
                                'title': {
                                    'display': True,
                                    'text': y_column
                                }
                            },
                            'x': {
                                'title': {
                                    'display': True,
                                    'text': x_column
                                }
                            }
                        }
                    },
                    'insights': viz['insights']
                }
                chart_configs.append(config)
            
            elif chart_type == 'Pie Chart':
                # Ensure we have a numeric column for values
                if len(columns) == 1:
                    
                    if not numeric_columns.any():
                        grouped_data = df[columns[0]].value_counts().reset_index()
                        grouped_data.columns = [columns[0], 'count']
                        
                    else:
                        # Numeric column: Use directly (sum is redundant here)
                        grouped_data = df[[columns[0]]].value_counts().reset_index()
                        grouped_data.columns = [columns[0], 'count']
                    
                    labels = grouped_data[columns[0]].tolist()
                    data_values = grouped_data['count'].tolist()

                    config = {
                        'chart_type': 'Pie',
                        'data': {
                            'labels': labels,
                            'datasets': [{
                                'data': data_values,
                                'backgroundColor': [
                                    'rgba(255, 102, 0, 0.6)',  
                                    'rgba(102, 178, 255, 0.6)', 
                                    'rgba(255, 221, 102, 0.6)',  
                                    'rgba(102, 255, 153, 0.6)',
                                    'rgba(186, 85, 211, 0.6)',  
                                    'rgba(255, 105, 180, 0.6)',
                                    'rgba(50, 205, 50, 0.6)',  
                                    'rgba(255, 0, 0, 0.6)',  
                                ]
                            }]
                        },
                        'options': {},
                        'insights': viz.get('insights', {})
                    }
                    

                elif len(columns)==2:
                    # Find the first numeric column for values
                    value_column = numeric_columns[0]
                    
                    # Group by the first categorical column and sum the numeric column
                    grouped_data = df.groupby(columns[0])[value_column].sum().reset_index()
                    
                    config = {
                        'chart_type': 'Pie',
                        'data': {
                            'labels': grouped_data[columns[0]].tolist(),
                            'datasets': [{
                                'data': grouped_data[value_column].tolist(),
                                'backgroundColor': [
                                    'rgba(255, 102, 102, 0.6)',  
                                    'rgba(102, 178, 255, 0.6)', 
                                    'rgba(255, 221, 102, 0.6)',  
                                    'rgba(102, 255, 153, 0.6)',
                                    'rgba(186, 85, 211, 0.6)',  
                                    'rgba(255, 105, 180, 0.6)',
                                    'rgba(50, 205, 50, 0.6)',  
                                    'rgba(255, 0, 0, 0.6)',  
                                ]
                            }]
                        },
                        'options': {
                            
                        },
                        'insights': viz['insights']
                    }
                
                chart_configs.append(config)
            
            elif chart_type == 'Line Chart':
                if len(columns) == 1:
                    if not numeric_columns.any():
                        grouped_data = df[columns[0]].value_counts().reset_index()
                        grouped_data.columns = [columns[0], 'count']
                        
                    else:
                        # Numeric column:
                        grouped_data = df[[columns[0]]].value_counts().reset_index()
                        grouped_data.columns = [columns[0], 'count']
                    
                    labels = grouped_data[columns[0]].tolist()
                    data_values = grouped_data['count'].tolist()

                    config = {
                        'chart_type': 'Line',
                        'data': {
                            'labels': labels,
                            'datasets': [{
                                'label': 'Count',  # Add a label
                                'data': data_values,
                                'borderColor': 'rgb(75, 192, 192)',
                                'backgroundColor': 'rgba(75, 192, 192, 0.2)',
                                'fill': False,
                                'tension': 0.1,
                            }]
                        },
                        'options': {
                            'responsive': True,
                            'maintainAspectRatio': False,
                            'scales': {
                                'y': {
                                    'beginAtZero': True
                                },
                                'x': {
                                    'ticks': {
                                        'maxRotation': 45,  # Rotate labels if many
                                        'autoSkip': True,   # Automatically skip some labels if too many
                                        'maxTicksLimit': 10  # Limit number of x-axis ticks
                                    }
                                }
                            }
                        },
                        'insights': viz.get('insights', {})
                    }
                    

                elif len(columns)==2:
                    
                    
                    x_column = columns[0];
                    y_column = columns[1];
                    
                    
                    
                    if viz['y_col_type'] == 'Avg':
                        grouped_data = df.groupby(x_column)[y_column].mean().reset_index()
                    else:
                        grouped_data = df.groupby(x_column)[y_column].sum().reset_index()
                    
                    config = {
                        'chart_type': 'Line',
                        'data': {
                            'labels': grouped_data[x_column].tolist(),
                            'datasets': [{
                                'label': 'Count',  # Add a label
                                'data': grouped_data[y_column].tolist(),
                                'borderColor': 'rgb(75, 192, 192)',
                                'backgroundColor': 'rgba(75, 192, 192, 0.2)',
                                'fill': False,
                                'tension': 0.1,
                            }]
                        },
                        'options': {
                            'responsive': True,
                            'maintainAspectRatio': False,
                            'scales': {
                                'y': {
                                    'beginAtZero': True,
                                    'title': {
                                    'display': True,
                                    'text': y_column
                                    }
                                },
                                'x': {
                                    'ticks': {
                                        'maxRotation': 45,  # Rotate labels if many
                                        'autoSkip': True,   # Automatically skip some labels if too many
                                        'maxTicksLimit': 10  # Limit number of x-axis ticks
                                    },
                                    'title': {
                                    'display': True,
                                    'text': x_column
                                    }
                                }
                            }
                        },
                        'insights': viz.get('insights', {})
                    }
                
                chart_configs.append(config)
            
            #elif chart_type == 'scatter chart':



        

        except Exception as e:
            print(f"Error creating chart for {chart_type}: {str(e)}")

    return chart_configs

"""def process_csv_and_get_charts(recommendation):
    
    # Ensure columns are clean
    df.columns = df.columns.str.strip()
    
    # Generate chart configurations
    chart_configs = create_chart_configs(recommendation, df)
    
    return chart_configs"""




"""@visualization_blueprint.route('/predict', methods=['GET'])
def predict():
    
    try:
        predictions = recommend_visualizations(schema)
        return jsonify({"visualizations": predictions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500"""


    
@visualization_blueprint.route('/charts', methods=['POST'])
def generate_charts():
    try:
        # Debugging incoming request
        print(f"Received request: {request.json}")
        
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "No data provided"}), 400

        file_id = request_data.get('file_id')
        if not file_id:
            return jsonify({"error": "file_id is required"}), 400

        print(f"Fetching file with ID: {file_id}")

        # Initialize GridFS
        fs = gridfs.GridFS(mongo.db)
        
        # Retrieve file metadata
        metadata = mongo.db.file_metadata.find_one({"file_id": file_id})
        if not metadata:
            return jsonify({"error": f"File with ID {file_id} not found"}), 404

        # Retrieve file from GridFS
        file_record = fs.get(ObjectId(file_id))
        file_content = file_record.read()
        
        # Convert to DataFrame based on file type
        if metadata['file_type'] == '.csv':
            df = pd.read_csv(io.BytesIO(file_content))
        elif metadata['file_type'] in ['.xls', '.xlsx']:
            df = pd.read_excel(io.BytesIO(file_content))
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        print(f"Successfully loaded file with {len(df)} rows")

        #------------old way of retreving data --------------
        # Retrieve file data from MongoDB
        #file_data = mongo.db.files.find_one({"_id": ObjectId(file_id)})
        #if not file_data:
         #   return jsonify({"error": f"File with ID {file_id} not found"}), 404

        # Load data into a DataFrame
        #df = pd.DataFrame(file_data["data"])
        #print(f"Successfully loaded file with {len(df)} rows")  # Debug print

        # Generate schema and recommendations
        schema = [{"name": col, "type": str(df[col].dtype)} for col in df.columns]
        recommendations = recommend_visualizations(schema)

        if not recommendations.get('visualizations'):
            return jsonify({"error": "No visualizations could be generated"}), 500

        # Create chart configs
        chart_configs = create_chart_configs(recommendations, df)
        if not chart_configs:
            return jsonify({"error": "Failed to create chart configurations"}), 500

        # Prepare data for MongoDB insertion
        config_entry = {
            "file_name":"sales3",
            "data_id": file_id, 
            "user_id":"67864b33172ed56267fgh1e", # To track which dataset this config belongs to
            "chart_configs": chart_configs,
            
        }

        # Insert the config into MongoDB
        config_id = mongo.db.visualisation_configs.insert_one(config_entry).inserted_id 
        print("config inserted",config_id)

        return jsonify({"chart_configs": chart_configs}), 200

    except Exception as e:
        print(f"Error in generate_charts: {str(e)}")  # Debug print
        return jsonify({"error": f"Failed to generate charts: {str(e)}"}), 500