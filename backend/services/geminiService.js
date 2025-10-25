const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const nlpService = require('./nlpService');

class GeminiService {
  constructor() {
    // Initialize Gemini client
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.warn('⚠️  Gemini API key not configured. Gemini features will be disabled.');
      this.geminiEnabled = false;
    } else {
      console.log('✅ Gemini API configured successfully');
      this.geminiEnabled = true;
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    
    // Configuration from environment variables
    this.config = {
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 300,
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
      safetyThreshold: process.env.GEMINI_SAFETY_THRESHOLD || 'BLOCK_MEDIUM_AND_ABOVE'
    };

    // Safety settings for mental health conversations
    this.safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // More strict for mental health context
      },
    ];

    // System prompts for different scenarios
    this.systemPrompts = {
      general: `You are MindBot, a compassionate AI mental health companion designed specifically for college students and young adults. You are integrated into a comprehensive mental health support system.
      
      Your Core Purpose:
      - Provide immediate, empathetic support for mental health concerns
      - Help users process emotions and thoughts in a safe space
      - Guide users toward healthy coping strategies and resources
      - Recognize when professional intervention is needed
      
      Communication Style:
      - Be warm, empathetic, and non-judgmental
      - Use age-appropriate language for college students
      - Keep responses concise but meaningful (2-4 sentences typically)
      - Ask thoughtful follow-up questions to encourage deeper reflection
      - Validate emotions while gently offering perspective when helpful
      
      Important Boundaries:
      - Never diagnose mental health conditions
      - Never recommend specific medications
      - Always encourage professional help for serious concerns
      - If someone mentions self-harm or suicide, immediately provide crisis resources
      - Acknowledge your limitations as an AI
      
      Crisis Response:
      If detecting crisis language (suicide, self-harm, "can't go on", etc.):
      - Express immediate concern and validation
      - Strongly encourage professional help
      - Provide specific crisis resources (988, crisis text line)
      - Keep the person engaged while directing to human help
      
      Remember: You're the first line of support in a larger mental health system. Your goal is to provide immediate comfort while connecting users to appropriate human resources when needed.`,
      
      crisis: `You are MindBot in crisis intervention mode. The user has expressed concerning thoughts.
      
      IMMEDIATE PRIORITIES:
      - Express genuine concern and empathy
      - Validate their pain without dismissing it
      - Gently encourage professional help or crisis resources
      - Provide immediate coping strategies
      - Keep them engaged in conversation
      - DO NOT minimize their feelings
      - Offer hope while taking their concerns seriously
      
      Crisis resources to mention:
      - National Suicide Prevention Lifeline: 988
      - Crisis Text Line: Text HOME to 741741
      - Emergency services: 911
      
      Your goal is to provide immediate support while encouraging professional intervention.`,
      
      supportive: `You are MindBot in supportive mode. The user is going through difficult emotions but not in immediate crisis.
      
      Focus on:
      - Active listening and validation
      - Gentle guidance and coping strategies
      - Building resilience and self-awareness
      - Encouraging healthy habits
      - Providing hope and perspective
      - Asking thoughtful questions to help them process emotions
      
      Techniques to use:
      - Cognitive behavioral approaches
      - Mindfulness suggestions
      - Breathing exercises
      - Gratitude practices
      - Social connection encouragement`
    };
  }

  /**
   * Get appropriate system prompt based on conversation context
   * @param {Object} context - Conversation context
   * @returns {string} System prompt
   */
  getSystemPrompt(context = {}) {
    if (context.crisisDetected) {
      return this.systemPrompts.crisis;
    } else if (context.supportLevel === 'elevated') {
      return this.systemPrompts.supportive;
    } else {
      return this.systemPrompts.general;
    }
  }

  /**
   * Generate AI response using Gemini
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous messages in conversation
   * @param {Object} context - Additional context (mood, risk level, etc.)
   * @returns {Object} AI response with analysis
   */
  async generateResponse(userMessage, conversationHistory = [], context = {}) {
    try {
      // First, analyze the user's message with NLP
      const nlpAnalysis = nlpService.analyzeText(userMessage);
      
      // Update context based on NLP analysis
      const updatedContext = {
        ...context,
        crisisDetected: nlpAnalysis.crisis.isCrisis,
        supportLevel: nlpAnalysis.overallAssessment.supportLevel,
        detectedEmotions: nlpAnalysis.emotions,
        sentiment: nlpAnalysis.sentiment
      };

      // Handle crisis situations immediately
      if (nlpAnalysis.crisis.isCrisis) {
        return {
          message: this.getCrisisResponse(nlpAnalysis),
          nlpAnalysis,
          context: updatedContext,
          requiresHumanIntervention: true,
          responseType: 'crisis',
          aiService: 'gemini'
        };
      }

      // Check if Gemini is enabled
      if (!this.geminiEnabled || !this.genAI) {
        console.log('Gemini not available, returning basic response');
        return {
          message: this.getFallbackResponse(nlpAnalysis, userMessage),
          nlpAnalysis,
          context: updatedContext,
          requiresHumanIntervention: nlpAnalysis.crisis.isCrisis,
          responseType: 'fallback',
          error: 'Gemini API not configured',
          aiService: 'fallback'
        };
      }

      // Build conversation context for Gemini
      const systemPrompt = this.getSystemPrompt(updatedContext);
      
      // Create conversation history string
      let conversationContext = systemPrompt + '\n\nConversation History:\n';
      
      // Add recent conversation history (limit to last 5 exchanges)
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        const role = msg.sender === 'user' ? 'User' : 'MindBot';
        conversationContext += `${role}: ${msg.content}\n`;
      });
      
      conversationContext += `User: ${userMessage}\nMindBot:`;

      // Initialize the model
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model,
        safetySettings: this.safetySettings
      });

      // Generate response using Gemini
      console.log(`🤖 Generating Gemini response using ${this.config.model}...`);
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: conversationContext }] }],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
          topP: 0.8,
          topK: 40,
        },
      });

      const response = await result.response;
      const aiResponse = response.text().trim();
      
      console.log('✅ Gemini response generated successfully');

      return {
        message: aiResponse,
        nlpAnalysis,
        context: updatedContext,
        requiresHumanIntervention: false,
        responseType: updatedContext.supportLevel === 'elevated' ? 'supportive' : 'general',
        aiService: 'gemini',
        usage: {
          promptTokens: response.promptFeedback?.blockReason ? 0 : 1, // Approximation
          completionTokens: aiResponse.split(' ').length, // Rough approximation
          totalTokens: response.promptFeedback?.blockReason ? 0 : aiResponse.split(' ').length + 1
        }
      };

    } catch (error) {
      console.error('Gemini response generation error:', error);
      
      // Fallback response based on NLP analysis
      const nlpAnalysis = nlpService.analyzeText(userMessage);
      
      return {
        message: this.getFallbackResponse(nlpAnalysis, userMessage),
        nlpAnalysis,
        context: { crisisDetected: nlpAnalysis.crisis.isCrisis },
        requiresHumanIntervention: nlpAnalysis.crisis.isCrisis,
        responseType: 'fallback',
        error: `Gemini AI service error: ${error.message}`,
        aiService: 'fallback'
      };
    }
  }

  /**
   * Generate crisis response
   * @param {Object} nlpAnalysis - NLP analysis results
   * @returns {string} Crisis response message
   */
  getCrisisResponse(nlpAnalysis) {
    let crisisResponse = "I'm really concerned about what you're sharing with me. Your feelings are valid, and you don't have to go through this alone.";
    
    // Add specific resources based on crisis indicators
    if (nlpAnalysis.crisis.indicators.some(indicator => 
      indicator.includes('suicide') || indicator.includes('kill'))) {
      crisisResponse += "\n\n🆘 **Immediate Resources:**\n";
      crisisResponse += "• National Suicide Prevention Lifeline: **988** (24/7)\n";
      crisisResponse += "• Crisis Text Line: Text **HOME** to **741741**\n";
      crisisResponse += "• Emergency Services: **911**\n\n";
      crisisResponse += "You matter, and your life has value. Please reach out to one of these resources right now.";
    } else {
      crisisResponse += " Have you considered speaking with a mental health professional or counselor?";
    }
    
    return crisisResponse;
  }

  /**
   * Generate fallback response when AI service is unavailable
   * @param {Object} nlpAnalysis - NLP analysis results
   * @param {string} userMessage - Original user message for context
   * @returns {string} Fallback response
   */
  getFallbackResponse(nlpAnalysis, userMessage = '') {
    if (nlpAnalysis.crisis.isCrisis) {
      return this.getCrisisResponse(nlpAnalysis);
    }
    
    const message = userMessage.toLowerCase();
    
    // Context-aware responses based on message content
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm glad you reached out. I'm MindBot, and I'm here to provide support and listen to what's on your mind. How are you feeling today?";
    }
    
    if (message.includes('stressed') || message.includes('stress') || message.includes('overwhelmed')) {
      return "I understand you're feeling stressed and overwhelmed. Here are some immediate techniques that can help:\n\n• Take 5 deep breaths - breathe in for 4 counts, hold for 4, out for 6\n• Write down what's stressing you most right now\n• Break one big task into smaller, manageable steps\n• Take a short walk or do some light stretching\n\nStress is temporary, and you have the strength to handle this. What feels most manageable to try first?";
    }
    
    if (message.includes('anxious') || message.includes('anxiety')) {
      return "I hear that you're feeling anxious. Here are some proven techniques to help calm anxiety:\n\n• 4-7-8 Breathing: Inhale for 4, hold for 7, exhale for 8\n• Ground yourself: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste\n• Hold an ice cube or splash cold water on your face\n\nAnxiety is temporary and you've handled difficult moments before. You can get through this too.";
    }
    
    // General supportive response based on sentiment
    if (nlpAnalysis.sentiment.sentiment === 'negative') {
      return "I can hear that you're going through something difficult right now. Your feelings are completely valid, and I want you to know that you don't have to face this alone. What's been the hardest part of what you're experiencing?";
    }
    
    return "Thank you for sharing that with me. I'm here to listen and support you. Your thoughts and feelings are important. What would be most helpful for you to talk about right now?";
  }

  /**
   * Check if Gemini service is available
   * @returns {boolean} Service availability
   */
  isAvailable() {
    return this.geminiEnabled;
  }

  /**
   * Get service info
   * @returns {Object} Service configuration info
   */
  getServiceInfo() {
    return {
      enabled: this.geminiEnabled,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      safetyThreshold: this.config.safetyThreshold
    };
  }
}

module.exports = new GeminiService();