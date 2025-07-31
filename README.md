# Wellcheck - Mental Health Burnout Predictor 🌿

Wellcheck is a web application built to help individuals assess their mental health and predict burnout levels. The app provides a smooth, positive user experience with gentle UI, encouraging messaging, and a predictive model backed by Python.

---

## ✨ Features

- User-friendly mental wellness interface
- Login/Signup authentication using Clerk
- Burnout prediction using a Python ML model
- Responsive and calming design
- Anonymous-friendly if needed
- Motivational mental health quotes and affirmations

---

## 🛠 Tech Stack

| Frontend    | Backend         | ML Model      |
|-------------|------------------|---------------|
| React (Vite) | Node.js/Express (optional) | Python + Scikit-learn |
| React Router | Clerk for auth  | Burnout prediction |

---

## 🖥️ Installation Guide



```bash
#1 Clone the repo
git clone https://github.com/your-username/wellcheck.git
cd wellcheck

#2 Navigate to the frontend directory
cd client

#3 Install dependencies
npm install

#4 Create a .env file in the root of the /client directory
# Add your Clerk and API keys
cp .env.example .env

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://127.0.0.1:8000/predict

#5 Navigate to the backend/server directory from the root
cd ../server

#6 Create and activate a virtual environment
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

#7 Install required Python packages
pip install -r requirements.txt

#8 In your first terminal (from the /client directory):
# Run the React frontend
npm run dev

#9 In your second terminal (from the /server directory):
# Run the Python backend server
python app.py
