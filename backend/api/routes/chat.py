'''from flask import Flask, Blueprint, request, jsonify
import pandas as pd 
import os
from dotenv import load_dotenv

load_dotenv() 

from flask_cors import CORS
from .. import mongo
from bson.objectid import ObjectId
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
import google.generativeai as genai

import faiss
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.docstore import InMemoryDocstore




#api_key = os.getenv("GOOGLE_GEMINI_API")
api_key = "AIzaSyDjv8OplGguDN70fLE3ljKrEeTX9-16X78"
if not api_key:
    raise ValueError("API Key not found! Check .env file or environment variables.")
# Configure the Gemini API
genai.configure(api_key=api_key)
    
# Create the generative model
model = genai.GenerativeModel('gemini-1.5-flash')

# Initialize Blueprint
chat_blueprint = Blueprint('chat', __name__)
CORS(chat_blueprint, supports_credentials=True, resources={
    r"/insights/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Initialize Embeddings Model
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=api_key
)

# FAISS Index Storage Path
# FAISS Index Storage Path
FAISS_INDEX_PATH = os.path.join(os.getcwd(), "vector_store")

# Load FAISS Index (or Create if not exists)
if os.path.exists(FAISS_INDEX_PATH):
    try:
        vectorstore = FAISS.load_local(
            FAISS_INDEX_PATH, 
            embeddings,
            allow_dangerous_deserialization=True  # Only use if you trust the source of the vector store
        )
    except Exception as e:
        print(f"Error loading existing vector store: {e}")
        # If loading fails, create new vector store
        vectorstore = FAISS.from_texts(
            texts=[""], 
            embedding=embeddings,
            metadatas=[{"source": "initialization"}]
        )
else:
    # Create an empty vector store
    vectorstore = FAISS.from_texts(
        texts=[""], 
        embedding=embeddings,
        metadatas=[{"source": "initialization"}]
    )

# Modified save function to ensure directory exists
def save_vectorstore():
    os.makedirs(FAISS_INDEX_PATH, exist_ok=True)  # Ensure directory exists
    vectorstore.save_local(FAISS_INDEX_PATH)

last_processed_data_id = None
def process_uploaded_data(data_id):
    print(f"Looking for data_id: {data_id}")
    file_data = mongo.db.files.find_one({"_id": ObjectId(data_id)})
    print(f"Found file_data: {file_data}")
    
    if not file_data:
        return False, "Data not found"

    # Convert the data to string format if it's not already
    data = file_data.get("data", [])
    if isinstance(data, list):
        # Convert the list of dictionaries to a string representation
        text_content = "\n".join(str(item) for item in data)
    else:
        text_content = str(data)
    
    print(f"Text content length: {len(text_content)}")
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_text(text_content)
    
    # Add documents to existing vectorstore
    try:
        vectorstore.add_texts(texts)
        save_vectorstore()
        return True, "Embeddings stored successfully"
    except Exception as e:
        print(f"Error storing embeddings: {e}")
        return False, f"Error storing embeddings: {str(e)}"

# **2. Retrieve Relevant Data**
def get_relevant_data(query):
    """Retrieve relevant chunks from FAISS based on user query."""
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})  # Get top 3 relevant chunks
    docs = retriever.get_relevant_documents(query)
    return "\n".join([doc.page_content for doc in docs])

# **3. Handle Chat Requests**
@chat_blueprint.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        data_id = data.get("data_id")
        user_query = data.get("message")

        if not data_id or not user_query:
            return jsonify({"success": False, "error": "Missing data_id or message"}), 400

        # Process uploaded data and handle potential failures
        success, message = process_uploaded_data(data_id)
        if not success:
            return jsonify({"success": False, "error": message}), 500

        # Retrieve relevant data from FAISS
        context = get_relevant_data(user_query)

        # Combine user query with relevant context
        final_prompt = f"Context:\n{context}\n\nUser Query: {user_query}"
        print("Final Prompt Sent to AI:", final_prompt)  # Debugging
        # Get AI Response
        ai_response = model.generate_content(final_prompt)

        return jsonify({"success": True, "response": ai_response.text})
    
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"success": False, "error": str(e)}), 500'''

from langchain_experimental.agents.agent_toolkits.csv.base import create_csv_agent
from langchain.llms.base import LLM
from langchain.schema import AgentFinish
from langchain.agents.output_parsers import ReActSingleInputOutputParser
from langchain.agents import Tool
from langchain_experimental.tools.python.tool import PythonAstREPLTool
import pandas as pd
import tempfile
import io
import os

from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from bson.objectid import ObjectId
import google.generativeai as genai
import traceback
from .. import mongo

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_GEMINI_API")
if not api_key:
    raise ValueError("API Key not found! Check .env file or environment variables.")

# Configure Gemini API
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

# Custom Gemini LLM wrapper
class GeminiLLM(LLM):
    def _call(self, prompt: str, stop=None) -> str:
        response = model.generate_content(prompt)
        print("Gemini Response:", response.text) 
        return response.text

    @property
    def _identifying_params(self):
        return {"model": "gemini-1.5-flash"}

    def _llm_type(self):
        return "gemini"

# Custom Output Parser to handle Gemini's response
class CustomOutputParser(ReActSingleInputOutputParser):
    def parse(self, text: str) -> AgentFinish:
        if "Final Answer:" in text:
            final_answer = text.split("Final Answer:")[-1].strip()
            return AgentFinish(return_values={"output": final_answer}, log=text)
        else:
            raise ValueError("Could not parse LLM output.")

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

def process_uploaded_data_to_csv(data_id):
    """
    Retrieve data from Mongo, convert it to a DataFrame,
    then write it to a temporary CSV file.
    """
    print(f"Processing data for ID: {data_id}")
    file_data = mongo.db.files.find_one({"_id": ObjectId(data_id)})
    if not file_data:
        return None, "Data not found"

    data = file_data.get("data", [])
    if isinstance(data, list):
        df = pd.DataFrame(data)
    else:
        try:
            df = pd.read_csv(io.StringIO(str(data)))
        except Exception as e:
            return None, f"Error reading data: {e}"
    
    temp_file = tempfile.NamedTemporaryFile(mode="w+", delete=False, suffix=".csv")
    df.to_csv(temp_file.name, index=False)
    temp_file.close()
    print(f"CSV file created at: {temp_file.name}")
    return temp_file.name, "CSV created successfully"

@chat_blueprint.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        data_id = data.get("data_id")
        user_query = data.get("message")
        if not data_id or not user_query:
            return jsonify({"success": False, "error": "Missing data_id or message"}), 400

        print(f"Received query: {user_query} for data ID: {data_id}")

        # Convert stored data into a CSV file.
        csv_file_path, msg = process_uploaded_data_to_csv(data_id)
        if not csv_file_path:
            print("Error in CSV conversion:", msg)
            return jsonify({"success": False, "error": msg}), 500

        # Create a GeminiLLM instance and CSV agent with custom output parser.
        llm = GeminiLLM()
        #tools = [PythonAstREPLTool()]
        agent = create_csv_agent(
            llm,
            csv_file_path,
            verbose=True,
            allow_dangerous_code=True,
            agent_executor_kwargs={
                "handle_parsing_errors": True,
                #"max_iterations": 5,  # Limit iterations to prevent loops
                "output_parser": CustomOutputParser()  # Use custom parser
            }
        )

        # Run the agent with the user's query.
        answer = agent.invoke(user_query)["output"]
        print("Agent answer:", answer)
        return jsonify({"success": True, "response": answer})
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print("Error in chat endpoint:", error_trace)
        return jsonify({"success": False, "error": str(e)}), 500