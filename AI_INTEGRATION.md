# AI Integration with Gemini

This document describes the AI integration implemented using Google Gemini AI for startup analysis.

## Features Implemented

### 1. AI Analysis Service (`backend/ai_analysis_service.py`)
- **4-Vector Evaluation Framework**: Comprehensive startup analysis across:
  - Founders/Team: Market fit, experience, background
  - Market & Problem: Problem size, TAM, competition
  - Differentiation: Tech/IP, business model, moats
  - Business Traction: Revenue metrics, unit economics, growth

- **Risk Assessment**: AI-powered risk level determination (LOW/MEDIUM/HIGH)
- **Scoring System**: AI scores from 1-10 based on comprehensive analysis
- **Key Insights**: Automated generation of investment insights
- **Red Flags**: Identification of potential risk factors
- **Sector Benchmarks**: Industry comparison metrics
- **Investment Recommendations**: AI-generated investment guidance

### 2. Backend API Endpoints
- `POST /applications/{id}/analyze` - Trigger AI analysis on an application
- `POST /applications/{id}/chat` - Interactive AI chat about specific startups
- `GET /applications/{id}` - Get complete application data with AI analysis
- `GET /applications` - List all applications with AI insights

### 3. Frontend Integration
- **Real-time AI Analysis**: Frontend displays actual AI-generated insights
- **Interactive Chat Interface**: Users can ask questions about startups
- **Dynamic Data Loading**: Applications fetched from Firestore with AI analysis
- **Error Handling**: Comprehensive error handling for AI service failures

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the backend directory with:

```bash
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY_FILE=fischer-3e391-firebase-adminsdk-fbsvc-8ae6e3cb30.json
FIREBASE_STORAGE_BUCKET=fischer-3e391.appspot.com

# Google Gemini AI API Key (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies
```bash
cd backend
pip install google-generativeai
```

### 3. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## How It Works

### 1. Application Submission
1. User submits application with documents
2. Documents are processed and stored in Firestore
3. PDF content is extracted using Gemini AI
4. Application is ready for AI analysis

### 2. AI Analysis Process
1. Call `POST /applications/{id}/analyze`
2. AI service analyzes application data and documents
3. Gemini AI generates comprehensive analysis
4. Results stored in Firestore
5. Frontend displays real AI insights

### 3. Interactive Chat
1. User asks question about startup
2. Chat interface calls `POST /applications/{id}/chat`
3. Gemini AI provides contextual response
4. Real-time conversation with AI analyst

## AI Analysis Output

The AI analysis includes:

```json
{
  "ai_score": 8.5,
  "risk_level": "LOW",
  "key_insights": [
    "Strong product-market fit indicators",
    "Experienced founding team",
    "Healthy unit economics"
  ],
  "red_flags": [],
  "sector_benchmarks": {
    "revenue_multiple": "2.5x (Industry avg: 3.2x)",
    "growth_rate": "15% MoM (Industry avg: 12% MoM)",
    "burn_multiple": "1.8x (Industry avg: 2.1x)"
  },
  "recommendations": [
    "Strong investment opportunity",
    "Consider due diligence on customer concentration"
  ],
  "confidence_score": 0.85,
  "curation_framework": {
    "founders_team": { "score": 8.5, "founder_market_fit": "..." },
    "market_problem": { "score": 8.0, "problem_size": "..." },
    "differentiation": { "score": 7.5, "tech_ip": "..." },
    "business_traction": { "score": 9.0, "revenue_metrics": "..." }
  }
}
```

## Error Handling

- **AI Service Unavailable**: Graceful fallback to basic analysis
- **API Key Missing**: Clear error messages for configuration issues
- **Network Errors**: Retry mechanisms and user-friendly error messages
- **Analysis Failures**: Fallback analysis with reduced confidence scores

## Performance Considerations

- **Async Processing**: AI analysis runs asynchronously
- **Caching**: Analysis results stored in Firestore
- **Rate Limiting**: Respects Gemini API rate limits
- **Timeout Handling**: Configurable timeouts for AI requests

## Testing

To test the AI integration:

1. Start the backend server: `uvicorn main:app --reload`
2. Start the frontend: `npm run dev`
3. Submit an application with documents
4. Wait for document processing to complete
5. Trigger AI analysis via the dashboard
6. Test the chat interface with questions about the startup

## Troubleshooting

### Common Issues

1. **"AI Analysis Service not available"**
   - Check GEMINI_API_KEY is set correctly
   - Verify API key has proper permissions

2. **"Application processing not complete"**
   - Wait for document processing to finish
   - Check Firestore for processing status

3. **Chat responses are generic**
   - Ensure documents were processed successfully
   - Check that extracted content is available

### Debug Mode

Enable debug logging by setting:
```bash
export PYTHONPATH=/path/to/backend
export DEBUG=1
```

This will show detailed AI analysis logs and help identify issues.
