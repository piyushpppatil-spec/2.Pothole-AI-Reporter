import os
import json
import base64
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = Flask(__name__, static_folder="../frontend")
CORS(app)

# Initialize Gemini Client
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment.")
    client = genai.Client(api_key=api_key)
except Exception as e:
    client = None
    print(f"Warning: Could not initialize Gemini client: {e}")

@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route("/api/analyze", methods=["POST"])
def analyze_pothole():
    if not client:
        return jsonify({"error": "Gemini API client not initialized. Check your GEMINI_API_KEY in the .env file."}), 500

    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    location = data.get("location", "Unknown Location")
    road_type = data.get("roadType", "Unknown Road Type")
    size = data.get("size", "Unknown Size")
    depth = data.get("depth", "Unknown Depth")
    description = data.get("description", "No description provided")
    image_base64 = data.get("image_base64")

    prompt = f"""
    You are an expert civil engineer and a municipal AI assistant analyzing road hazards.
    A citizen has reported a pothole with the following details:
    
    - Location: {location}
    - Road Type: {road_type}
    - Size: {size}
    - Depth: {depth}
    - Description: {description}
    
    Please analyze this report and provide a JSON response with the following keys EXACTLY:
    "severity": string (Critical, High, Medium, or Low) based on the danger posed.
    "cost_estimate": string (An estimated repair cost range in Indian Rupees (INR), e.g., '₹5,000 - ₹10,000') based on typical Indian municipal repair costs for the size and depth.
    "safety_risks": array of strings (List of specific dangers like 'tyre burst', 'two-wheeler accidents', etc.)
    "complaint_letter": string (A full, formal complaint letter addressed to the Public Works Department or Municipal Corporation, incorporating the details provided, ready to send).

    Output ONLY a valid JSON object. Do not include markdown formatting like ```json.
    """

    contents = [prompt]
    
    if image_base64:
        try:
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
            image_bytes = base64.b64decode(image_base64)
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type='image/jpeg'
            )
            contents.append(image_part)
            contents.append("\nAlso carefully analyze the provided image of the pothole to adjust severity, cost, and identify visible safety risks.")
        except Exception as e:
            print("Error processing image:", e)

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        result_json = json.loads(response.text)
        return jsonify(result_json)
    except Exception as e:
        print(f"Error during AI generation: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
