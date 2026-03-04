# Farmer Assist - Smart Agricultural Advisory System

A comprehensive agricultural advisory platform that helps farmers with crop disease detection, AI-powered crop advice, expert consultations, and weather forecasting.

## Features

- **Disease Detection** - Upload crop images for AI-powered disease identification using deep learning
- **AI Crop Advice** - Multi-tool AI agent (Google ADK) for intelligent crop management queries
- **Expert Consultation** - Connect with agricultural experts for escalated issues
- **Weather Forecast** - Real-time weather data for farming decisions
- **Location-based Services** - District and city selection for localized advice
- **Multi-language Support** - Available in English and Telugu

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLModel
- **AI/ML**: 
  - Google ADK (Agent Development Kit)
  - Gemini LLM
  - Sentence Transformers (RAG)
  - PyTorch/TensorFlow (Disease Detection)
- **Vector Database**: Qdrant
- **Authentication**: JWT with OTP verification
- **Cloud Storage**: Google Cloud Storage

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **i18n**: react-i18next
- **Charts**: Recharts

## Project Structure

```
farmerAssist/
├── backend/
│   ├── Auth/               # Authentication (JWT, OTP)
│   ├── LLM/                # AI Agents & Retrieval
│   │   ├── multi_tool_agent/
│   │   └── retrieval/
│   ├── routers/            # API endpoints
│   ├── Utils/              # Utilities
│   ├── diseasePrediction/ # Disease detection ML model
│   ├── database.py        # Database configuration
│   ├── main.py            # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api_services/  # API client functions
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/        # Page components
│   │   └── App.jsx       # Main app
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL 14+
- Google Cloud Account (for Gemini API, Cloud Storage)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv myenv

# Activate virtual environment
# Windows:
myenv\Scripts\activate
# Linux/Mac:
source myenv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Copy .env.example to .env and update with your credentials
cp .env.example .env

# Initialize database
python -c "from database import init_db; init_db()"

# Run server
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/genOTP` | Generate OTP |
| POST | `/auth/verifyOTP` | Verify OTP & Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/getUser` | Get current user |

### Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/location/getDistrict` | Get districts by state |
| GET | `/location/getCity` | Get cities by district |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/weather/getWeatherData` | Get weather forecast |

### Crop Advice
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/crop_advice/new_chat` | Start new chat |
| POST | `/crop_advice/continue_chat/{sessionId}` | Continue chat |

### Disease Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/disease/detect` | Detect disease from image |
| GET | `/disease/history` | Get detection history |
| GET | `/disease/{sessionId}` | Get specific result |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/history` | Get user history |
| GET | `/users/notifications` | Get notifications |

### Expert
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expert/dashboard` | Expert dashboard |
| GET | `/expert/getPendingQueries` | Get pending queries |
| POST | `/expert/expertAdvice` | Send expert reply |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Admin dashboard |
| POST | `/admin/addExpert` | Add expert |

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/farmer_assist
DATABASE_ASYNC_URL=postgresql+asyncpg://user:pass@localhost:5432/farmer_assist

# JWT
SECRET_KEY=your-secret-key

# Google APIs
GOOGLE_API_KEY=your-google-api-key
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_APPLICATION_CREDENTIALS=path-to-json

# Qdrant Vector DB
QDRANT_API_KEY=your-qdrant-key

# Hugging Face
HF_TOKEN=your-hf-token

# Sarvam AI (Speech)
SARVAM_API_KEY=your-sarvam-key

# Weather
WEATHER_API_KEY=your-weather-api-key

# Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
GCS_BUCKET_FOLDER_DISEASE=disease_images
GCS_BUCKET_FOLDER_MODEL=models

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
FROM_EMAIL=your-email
```

## Features in Detail

### Disease Detection
- Uses CNN-based deep learning model
- Supports 38+ crop diseases
- Confidence score provided
- Image stored in Google Cloud Storage

### AI Crop Advice
- Google ADK multi-tool agent
- Retrieval-Augmented Generation (RAG) with Qdrant
- Context-aware responses
- Multi-turn conversation support

### Expert Escalation
- Farmers can escalate complex issues
- Experts receive notifications
- Email notifications for replies

### Weather Integration
- 5-day weather forecast
- Agricultural-specific weather data
- Location-based queries

## License

This project is for educational purposes.
