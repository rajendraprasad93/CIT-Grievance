# CIT Campus Connect 🎓

**Hosted Link** : https://cit-campus-connect.web.app

A full-stack campus community platform for students to share moments, report issues, discover opportunities, and connect with peers.

![React](https://img.shields.io/badge/React-19.0-blue?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green?logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?logo=tailwindcss)

## Features

- **Moments Feed** - Share campus life updates, ask for help, post opportunities
- **Issue Tracker** - Report and track campus issues with community voting
- **Opportunities Board** - Discover internships, scholarships, and events
- **AI Image Analysis** - Auto-fill forms using Gemini AI vision
- **Global Search** - Search moments, people, and opportunities
- **User Profiles** - View activity, achievements, and reputation
- **Real-time Comments** - Engage with the community

## Tech Stack

**Frontend:**
- React 19 with React Router
- TailwindCSS + Radix UI components
- Framer Motion animations
- Axios for API calls

**Backend:**
- FastAPI (Python)
- MongoDB with Motor (async driver)
- Google Gemini AI for image analysis
- JWT-based authentication

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

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
