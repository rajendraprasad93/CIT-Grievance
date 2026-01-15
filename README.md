# CIT Campus Connect 🎓

**Hosted Link (Production)**: https://cit-campus-connect.web.app

**One Page Description** : [https://drive.google.com/file/d/1KD0CEdUxvbdRgHJ7Z7Z6vlIVdXfcbWt9/view?usp=drive_link](https://drive.google.com/file/d/1ICzz45LJdD0ekBYwxyzRtImqjr8r8C0y/view?usp=drive_link)

**Architecture Diagrams** : https://eashwar-kumar-t.github.io/campus-connect

**Repository Type**: Monorepo (Frontend + Backend)

CIT Campus Connect is a full-stack campus community platform that enables students to share moments, report issues, discover opportunities, and connect with peers.

This repository contains the **original MVP monorepo**, which was **initially designed for local development** and was later **migrated and deployed to a production-grade Google Cloud Platform (GCP) environment**, while fully retaining local development support.

---

## Overview

CIT Campus Connect follows a **modern full-stack architecture** with a clear separation of concerns between frontend, backend, and data layers.  
The project demonstrates a complete lifecycle from **local MVP development** to a **cloud-native, scalable production deployment**.

---

## Features

- **Moments Feed** – Share campus updates, ask for help, post opportunities
- **Issue Tracker** – Report and track campus issues with community voting
- **Opportunities Board** – Discover internships, scholarships, and events
- **AI Image Analysis** – Auto-fill forms using Google Gemini Vision AI
- **Global Search** – Search moments, users, and opportunities
- **User Profiles** – Activity history, achievements, and reputation
- **Real-time Comments** – Engage with posts and discussions

---

## Tech Stack

### Frontend
- React 19 with React Router
- TailwindCSS + Radix UI
- Framer Motion (animations)
- Axios for API communication

### Backend
- FastAPI (Python)
- MongoDB with Motor (async driver)
- Google Gemini AI (Vision)
- JWT-based authentication

### Cloud & Infrastructure (Production)
- Firebase Hosting (Frontend)
- Google Cloud Run (Backend)
- Google Cloud Storage (Media & assets)
- Managed cloud database services
- Google Cloud IAM, Logging, and Monitoring

---

## Cloud Deployment & Architecture (Production)

CIT Campus Connect was migrated from a local-first MVP to **Google Cloud Platform (GCP)** to support:

- Scalability
- Security
- High availability
- Observability
- Cost-efficient serverless execution

### Production Architecture Summary

- **Frontend**
  - React application deployed as static assets
  - Served via Firebase Hosting with global CDN

- **Backend API**
  - FastAPI backend containerized and deployed on Google Cloud Run
  - Stateless, auto-scaling execution
  - Secure HTTPS endpoints

- **Database**
  - Production data stored in managed cloud databases
  - Private access restricted to backend services

- **Media Storage**
  - User-uploaded files and images stored in Google Cloud Storage

- **Authentication & Security**
  - JWT-based authentication
  - IAM-controlled service access
  - Secure environment configuration and secrets

- **Observability**
  - Centralized logging
  - Monitoring and metrics
  - Error reporting for runtime diagnostics

---

## Deployment Modes

### Local Development Mode
Used for feature development, testing, and rapid iteration.

- Frontend runs locally on `http://localhost:3000`
- Backend runs locally on `http://localhost:5000`
- MongoDB runs locally or via MongoDB Atlas
- Environment variables loaded from `.env` files

### Cloud Production Mode
Used for real users and live traffic.

- Frontend served via Firebase Hosting
- Backend runs on Google Cloud Run
- Databases and storage are fully managed
- Secure networking, IAM, logging, and monitoring enabled

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/cit-campus-connect.git
cd cit-campus-connect
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

**Backend `.env` configuration:**
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="campus_connect"
CORS_ORIGINS="http://localhost:3000"
GEMINI_API_KEY="your_gemini_api_key"
```

**Start the backend:**
```bash
python server.py
# or
uvicorn server:app --reload --port 5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create .env file
cp .env.example .env
```

**Frontend `.env` configuration:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Start the frontend:**
```bash
npm start
# or
yarn start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Project Structure

```
├── backend/
│   ├── server.py           # FastAPI application
│   ├── services/           # Business logic services
│   │   └── universal_vision_service.py
│   ├── uploads/            # Uploaded files
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   └── App.js         # Main app component
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/dev-login` | Development login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/moments` | List all moments |
| POST | `/api/moments` | Create a moment |
| GET | `/api/issues` | List all issues |
| POST | `/api/issues` | Report an issue |
| GET | `/api/opportunities` | List opportunities |
| POST | `/api/analyze-image-universal` | AI image analysis |

## Development

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Seeding Mock Data

```bash
cd backend
python seed_mock_data.py
```

## Environment Variables

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URL` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | For AI features |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | Yes |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
