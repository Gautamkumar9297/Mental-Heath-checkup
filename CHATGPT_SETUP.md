# 🤖 ChatGPT API Integration Guide

## ✅ What's Already Implemented

Your backend already has **complete ChatGPT integration** set up! Here's what's included:

### Backend Features:
- **OpenAI ChatGPT Integration** using `gpt-3.5-turbo`
- **Mental Health Specialized Prompts** for counseling scenarios
- **Crisis Detection** with automatic intervention
- **Conversation Context** maintenance for better responses
- **Fallback Responses** when API is unavailable
- **NLP Analysis** combined with ChatGPT responses
- **Session Management** with full conversation history
- **Token Usage Tracking** and cost optimization

### API Endpoints:
- `GET /api/chatbot/test` - Test ChatGPT API connection
- `POST /api/chatbot/start-session` - Start new AI session
- `POST /api/chatbot/:sessionId/message` - Send message to ChatGPT
- `GET /api/chatbot/:sessionId/conversation` - Get conversation history
- `POST /api/chatbot/quick-support` - Quick AI support without full session

---

## 🔧 Setup Instructions

### Step 1: Get OpenAI API Key

1. **Visit OpenAI Platform**: https://platform.openai.com/api-keys
2. **Create Account** or **Sign In**
3. **Create New Secret Key**:
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)
   - ⚠️ **Save it securely** - you won't see it again!

### Step 2: Add API Key to Environment

1. **Open** `backend/.env` file
2. **Replace** this line:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```
   **With your actual key**:
   ```
   OPENAI_API_KEY=sk-proj-your-real-api-key-here
   ```

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ OpenAI API configured successfully
```

---

## 🧪 Testing the Integration

### Method 1: API Test Endpoint

```bash
# Test ChatGPT API directly
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/chatbot/test
```

### Method 2: Frontend Chat Interface

1. **Go to your AI Support page** (`/chat`)
2. **Start a chat session**
3. **Send a message** - you should get ChatGPT responses!

### Method 3: Quick Test (No Session)

```bash
curl -X POST http://localhost:5000/api/chatbot/quick-support \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel stressed about my exams"}'
```

---

## 💰 API Costs & Limits

### Pricing (as of 2024):
- **GPT-3.5-Turbo**: ~$0.0015 per 1K tokens
- **Average conversation**: ~100-300 tokens
- **Cost per message**: ~$0.0002-$0.0005 (very cheap!)

### Current Settings:
```
Model: gpt-3.5-turbo
Max Tokens: 300 per response
Temperature: 0.7 (balanced creativity)
```

### Free Tier:
- New OpenAI accounts get **$5 free credits**
- Should last for **thousands of test messages**

---

## 🛡️ Safety Features

### Crisis Detection:
- **Automatic detection** of crisis language
- **Immediate resources** provided (988, crisis text line)
- **Human intervention** flagged in database

### Content Safety:
- **Mental health specialized prompts**
- **Professional boundaries** maintained
- **No medical diagnoses** or prescriptions
- **Age-appropriate** language for college students

### Privacy:
- **User tracking** by session (not personal info)
- **Conversation history** stored securely
- **Token usage monitoring**

---

## 🔍 Troubleshooting

### If ChatGPT Doesn't Work:

1. **Check API Key**:
   ```bash
   # In backend, you should see:
   ✅ OpenAI API configured successfully
   
   # If you see this, API key is missing:
   ⚠️  OpenAI API key not configured. ChatGPT features will use fallback responses.
   ```

2. **Check Network/Firewall**:
   - OpenAI API requires outbound HTTPS (443)
   - Corporate networks might block it

3. **Check API Quota**:
   - Visit https://platform.openai.com/usage
   - Ensure you haven't exceeded limits

### Fallback Mode:
- **Automatic fallback** to rule-based responses
- **Crisis detection** still works
- **Users get helpful responses** even when API is down

---

## 🚀 Advanced Features

### Custom Prompts:
The system uses different prompts for:
- **General conversations**
- **Crisis situations**
- **Supportive guidance**

### Context Awareness:
- **User risk level** influences responses
- **Conversation history** provides context
- **Mood trends** inform AI responses

### Analytics:
- **Token usage tracking**
- **Response effectiveness**
- **Crisis intervention tracking**

---

## 📊 Monitoring & Analytics

### Backend Logs:
```
🤖 Generating ChatGPT response using gpt-3.5-turbo...
✅ ChatGPT response generated successfully
Tokens used: 156/300
```

### Database Tracking:
- **Conversation history** with sentiment analysis
- **Crisis flags** for human review
- **AI analysis** for counselor insights

---

## 🎯 Next Steps

1. **Get your OpenAI API key** and add it to `.env`
2. **Restart your backend server**
3. **Test the chat interface**
4. **Monitor usage** on OpenAI dashboard
5. **Customize prompts** as needed for your use case

Your mental health support system now has **enterprise-grade AI counseling** powered by ChatGPT! 🎉

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Look at backend console logs
3. Test with the `/api/chatbot/test` endpoint
4. Verify your OpenAI account has available credits