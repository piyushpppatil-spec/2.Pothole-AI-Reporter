# Pothole AI Reporter 🚧

An intelligent, AI-powered civic web application that allows citizens to report road hazards. The system uses Google's Gemini Vision AI to automatically analyze pothole images and descriptions, determine severity, estimate repair costs, and generate official government complaint letters.

## Features
- **Live AI Image Analysis:** Upload a photo and the AI will analyze the visual evidence of the pothole.
- **Smart Geolocation:** Automatically fetches your GPS coordinates and reverse-geocodes it into a real street address.
- **Automated Complaint Generation:** Automatically writes a professional, ready-to-send complaint letter to the municipal authorities.
- **Cost & Risk Assessment:** Intelligent breakdown of estimated repair costs and potential safety risks.

## Setup Instructions

To run this project on your local machine, follow these steps:

### 1. Download the Code
Clone this repository or download the ZIP file and extract it.

### 2. Get a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a free API Key.

### 3. Setup Environment Variables
1. Navigate to the `backend` folder.
2. Rename the `.env.example` file to `.env`.
3. Open `.env` and paste your API key inside:
   `GEMINI_API_KEY=your_actual_api_key_here`

### 4. Install Dependencies
Make sure you have Python installed, then open your terminal and run:
```bash
cd backend
pip install -r requirements.txt
```

### 5. Run the Application
Start the Flask server, which hosts both the backend AI and the frontend website:
```bash
python app.py
```

Finally, open your browser and go to: **http://127.0.0.1:5000**
