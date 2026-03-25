# Installation Instructions

Due to Windows PowerShell script execution policy, please install dependencies manually:

## Backend
```bash
cd backend
# All dependencies already installed
```

## Frontend
```bash
cd frontend
# Install required packages for new features
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities recharts
```

## Running the Application

### Start Backend:
```bash
cd backend
node server.js
```

### Start Frontend:
```bash
cd frontend
npm start
```

The backend will run on `http://localhost:5000`
The frontend will run on `http://localhost:3000`
