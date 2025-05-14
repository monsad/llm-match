# LLM Model Advisor

A web application that helps users identify and choose the most suitable LLM models for their specific use cases.

## Features

- User authentication and registration
- Comprehensive database of LLM models with detailed specifications
- Interactive questionnaire to capture user requirements
- Intelligent model recommendation engine
- User dashboard for saved recommendations
- Admin panel for database management

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React, Chakra UI
- **DevOps**: Docker, GitHub Actions

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/llm-model-advisor.git
   cd llm-model-advisor
   ```

2. Start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Initialize the database:
   ```bash
   docker-compose exec backend python -m app.db.seed
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs

### Default Admin Credentials

- Email: admin@llmadvisor.com
- Password: admin123 (change this in production)

## Development

### Backend Development

1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Run database migrations:
   ```bash
   alembic upgrade head
   ```

3. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Development

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### End-to-End Tests

```bash
cd frontend
npm run test:e2e
```

## Deployment

The application can be deployed using Docker Compose. A GitHub Actions workflow is included for CI/CD.

## Project Structure

```
├── .github/                # GitHub Actions workflows
├── backend/                # FastAPI backend
│   ├── app/                # Application code
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── db/             # Database models and sessions
│   │   ├── models/         # Pydantic models
│   │   └── schemas/        # Schema definitions
│   ├── migrations/         # Alembic migrations
│   └── tests/              # Unit tests
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/                # Source code
├── docker-compose.yml      # Docker Compose configuration
├── PRD.md                  # Product Requirements Document
└── stack-tech.md           # Technology Stack Documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
