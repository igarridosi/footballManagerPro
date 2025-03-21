# Football Manager Pro

A web application for managing football players, transfers, and statistics.

## Requirements

### Backend
- Python 3.8 or higher
- pip (Python package installer)

### Frontend
- Node.js 14.0 or higher
- npm (Node package manager)

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd <project-folder>
```

2. Set up the Backend
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# For Windows:
venv\Scripts\activate
# For macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python -m uvicorn app.main:app --reload --port 8000
```

3. Set up the Frontend
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

4. Access the application
- Backend API will be running at: http://localhost:8000
- Frontend application will be running at: http://localhost:5173

## Features
- Player management (add, edit, delete)
- Transfer system
- Player statistics
- Squad analysis
- Dark/Light mode
- Responsive design

## Development
- Backend is built with FastAPI
- Frontend is built with React + TypeScript + Vite
- Styling with Tailwind CSS

## Notes
- Make sure both backend and frontend servers are running simultaneously
- The backend must be running on port 8000 for the frontend to communicate with it
- Check the console for any error messages if you encounter issues

## Troubleshooting
- If you get a module not found error, make sure you've installed all dependencies
- If the frontend can't connect to the backend, ensure the backend server is running on port 8000
- For any other issues, check the console logs in both frontend and backend
