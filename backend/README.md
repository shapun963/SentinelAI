# Sentinel AI Backend

FastAPI-based backend for advanced AI content security analysis, featuring AdShield engine integration and Gemini AI enhancement.

## Features

### 🛡️ AdShield Engine
- **Prompt Injection Detection**: Advanced pattern matching and ML-based detection
- **PII Detection**: Comprehensive personally identifiable information scanning
- **Bias Analysis**: Multi-dimensional bias detection across racial, gender, age, and religious categories
- **Real-time Analysis**: Fast, efficient content processing

### 🧠 Gemini AI Integration
- **Enhanced Explanations**: Contextual insights using Google's Gemini API
- **Risk Assessment**: Intelligent risk evaluation and recommendations
- **Confidence Scoring**: AI-powered confidence assessment for all findings

### 🚀 API Features
- **RESTful Design**: Clean, intuitive API endpoints
- **Batch Processing**: Analyze multiple content items simultaneously
- **Health Monitoring**: Comprehensive system health and model status endpoints
- **CORS Support**: Cross-origin resource sharing for web applications

## Quick Start

### Prerequisites
- Python 3.8+
- pip package manager
- Optional: Gemini API key for enhanced analysis

### Installation & Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Run the startup script**:
   ```bash
   python start.py
   ```

   This will automatically:
   - Install all dependencies
   - Check environment configuration
   - Start the FastAPI server

3. **Manual setup** (alternative):
   ```bash
   pip install -r requirements.txt
   python main.py
   ```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

## API Documentation

### Base URL
- Development: `http://localhost:8000`
- Production: Configure according to deployment

### Key Endpoints

#### Content Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "prompt": "Text to analyze for security risks",
  "generated_output": "Optional AI-generated output",
  "include_gemini_analysis": true
}
```

#### Health Check
```http
GET /health
```

#### Model Status
```http
GET /api/models/status
```

#### Batch Analysis
```http
POST /api/analyze/batch
Content-Type: application/json

[
  {
    "prompt": "First text to analyze",
    "include_gemini_analysis": true
  },
  {
    "prompt": "Second text to analyze", 
    "include_gemini_analysis": false
  }
]
```

### Interactive Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Response Format

```json
{
  "promptInjection": {
    "score": 85,
    "detected": true,
    "indices": [
      {
        "start": 10,
        "end": 25,
        "type": "ignore_instructions",
        "severity": "high"
      }
    ]
  },
  "pii": {
    "score": 60,
    "detected": true,
    "indices": [
      {
        "start": 50,
        "end": 70,
        "type": "pii",
        "piiType": "email"
      }
    ]
  },
  "bias": {
    "score": 30,
    "detected": true,
    "indices": [...],
    "racial": 20,
    "gender": 30,
    "age": 10,
    "religious": 5
  },
  "overall": {
    "score": 75,
    "riskLevel": "high"
  },
  "summary": {
    "trustLens": "Content analysis summary...",
    "recommendations": ["Action 1", "Action 2"],
    "riskFactors": ["Risk 1", "Risk 2"]
  },
  "gemini_insights": {
    "enhancedAnalysis": {
      "riskAssessment": "...",
      "contextualInsights": "...",
      "securityImplications": "...",
      "mitigationStrategies": [...]
    },
    "technicalDetails": {...},
    "recommendations": {...},
    "confidence": {...}
  }
}
```

## Architecture

### Components

1. **AdShield Engine** (`shield_engine.py`)
   - Core analysis engine
   - Pattern-based detection
   - ML model integration
   - Scoring algorithms

2. **Gemini Analyzer** (`gemini_analyzer.py`)  
   - Google Gemini API integration
   - Enhanced insight generation
   - Contextual analysis
   - Fallback mechanisms

3. **FastAPI Application** (`main.py`)
   - REST API endpoints
   - Request/response handling
   - Error management
   - CORS configuration

### Analysis Pipeline

1. **Input Processing**: Validate and sanitize incoming content
2. **AdShield Analysis**: Run comprehensive security analysis
3. **Gemini Enhancement**: Generate AI-powered insights (optional)
4. **Response Formation**: Structure and return analysis results

## Model Information

### Built-in Models
- **Bias Detection**: `unitary/toxic-bert`
- **Sentiment Analysis**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Pattern Detection**: Custom regex and heuristic patterns

### External APIs
- **Gemini 1.5 Flash**: Enhanced analysis and explanations

## Performance

- **Response Time**: < 2 seconds for typical content
- **Throughput**: 50+ requests per minute
- **Memory Usage**: ~2GB with models loaded
- **Batch Processing**: Up to 50 items per batch request

## Development

### Running in Development Mode
```bash
DEBUG=true python main.py
```

### Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Logging
The application uses structured logging with configurable levels:
- `INFO`: General operation information
- `WARNING`: Non-critical issues
- `ERROR`: Error conditions
- `DEBUG`: Detailed debugging information

## Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

### Environment Variables for Production
```env
HOST=0.0.0.0
PORT=8000
DEBUG=false
LOG_LEVEL=INFO
GEMINI_API_KEY=production_key_here
```

## Security Considerations

- Input validation and sanitization
- Rate limiting (implement at reverse proxy level)
- API key protection
- CORS configuration for production
- Content length limits
- Batch size restrictions

## Contributing

1. Follow Python PEP 8 style guidelines
2. Add comprehensive docstrings
3. Include unit tests for new features
4. Update documentation as needed
5. Test with various content types and edge cases