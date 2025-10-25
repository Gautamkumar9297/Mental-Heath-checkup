# Gemini AI Integration Guide

## Overview

Your mental health support system is powered exclusively by Google's Gemini AI service for the chatbot functionality. This provides a focused, high-quality AI experience specifically optimized for mental health conversations.

## Configuration

### Environment Variables

Add the following to your `backend/.env` file:

```env
# Gemini AI Configuration (Google's AI Model - Only AI Service)
# Replace with your actual Gemini API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=300
GEMINI_TEMPERATURE=0.7
GEMINI_SAFETY_THRESHOLD=BLOCK_MEDIUM_AND_ABOVE

# AI Service Configuration - Gemini Only
AI_SERVICE_PREFERENCE=gemini
```

## Features

### Intelligent Response Generation

The system automatically:
- Uses Google's advanced Gemini AI for all conversations
- Provides intelligent fallback to rule-based responses if Gemini is unavailable
- Uses specialized prompts optimized for mental health contexts
- Applies strict safety settings for crisis situations

### Safety Features

- **Enhanced Safety Settings**: Gemini is configured with strict safety thresholds for mental health contexts
- **Crisis Detection**: Integrated NLP analysis for automatic crisis detection
- **Fallback Responses**: Comprehensive rule-based fallback system ensures users always get appropriate responses
- **Content Filtering**: Advanced content moderation to ensure safe interactions

### Service Status Monitoring

You can check the status of the AI service:

```javascript
const chatbotService = require('./services/chatbotService');
console.log(chatbotService.getServiceStatus());
```

This returns:
```json
{
  "gemini": {
    "enabled": true,
    "model": "gemini-1.5-flash",
    "maxTokens": 300,
    "temperature": 0.7,
    "safetyThreshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  "preferredService": "gemini",
  "selectedService": "gemini",
  "aiProvider": "Google Gemini Only"
}
```

## How It Works

### Service Selection Logic

1. **Crisis Detection**: For crisis situations, uses immediate fallback responses with crisis resources
2. **Gemini Processing**: All standard conversations are processed through Gemini AI
3. **Fallback System**: If Gemini is unavailable, uses comprehensive rule-based responses
4. **Response Generation**: Consistent interface with mental health-optimized responses

### Response Format

The AI service returns responses in this format:

```javascript
{
  message: "AI-generated response",
  nlpAnalysis: { /* NLP analysis results */ },
  context: { /* Updated conversation context */ },
  requiresHumanIntervention: false,
  responseType: "general", // or "supportive", "crisis", "fallback"
  aiService: "gemini", // or "fallback"
  usage: { /* Token usage information */ }
}
```

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file
5. Replace `your_actual_gemini_api_key_here` with your real API key

## Benefits of Gemini AI

1. **Advanced Capabilities**: Latest Gemini 1.5 Flash model with improved reasoning
2. **Cost Effective**: Competitive pricing with generous free tier
3. **Safety First**: Built-in safety features ideal for mental health applications
4. **Fast Response**: Optimized for quick, real-time conversations
5. **Multilingual Support**: Built-in support for multiple languages

## Testing

To test your Gemini integration:

```bash
cd backend
npm start
```

The console will show the AI service status:
- ✅ Gemini API configured successfully
- 🧠 Mental Health Chatbot initialized with Gemini AI

## Troubleshooting

### Common Issues

1. **"Gemini API key not configured"**
   - Check that `GEMINI_API_KEY` is set in your `.env` file
   - Ensure the API key is valid and active

2. **"gemini-pro is not found" error**
   - Update your model to `gemini-1.5-flash` (newer model)
   - Check that you're using the correct model name

3. **Service unavailable**
   - The system will gracefully fall back to rule-based responses
   - Check your internet connection and API key validity

### Monitoring Service Health

The system logs which service is selected for each conversation:
```
🎆 Selected AI service: gemini
🤖 Generating Gemini response using gemini-1.5-flash...
✅ Gemini response generated successfully
```

## Advanced Configuration

### Custom Safety Settings

You can customize Gemini's safety settings by modifying the `safetySettings` array in `geminiService.js`:

```javascript
this.safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Very strict
  },
  // Add more categories as needed
];
```

### Model Selection

Gemini supports different models:
- **gemini-1.5-flash**: Fast, efficient responses (recommended)
- **gemini-1.5-pro**: More advanced reasoning capabilities
- **gemini-pro**: Legacy model (deprecated)

Update the `GEMINI_MODEL` environment variable to change models.

## Mental Health Optimization

### Specialized Prompts

The system includes specialized prompts for:
- Crisis intervention
- Supportive conversations
- General mental health guidance
- College student-specific scenarios

### Context Awareness

- Maintains conversation context for personalized responses
- Tracks mood patterns and emotional states
- Provides appropriate escalation when needed

## Future Enhancements

This Gemini integration foundation supports:
- Multi-modal capabilities (text + images)
- Fine-tuned models specific to mental health
- Enhanced crisis detection algorithms
- Integration with professional counselor networks
- Advanced analytics on conversation effectiveness

---

Your mental health support system is now equipped with powerful Gemini AI! 🧠✨
