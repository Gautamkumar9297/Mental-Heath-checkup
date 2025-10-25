const nlpService = require('./nlpService');
const geminiService = require('./geminiService');

class ChatbotService {
  constructor() {
    // AI Service preference - now only supports Gemini
    this.preferredService = 'gemini';
    
    // Gemini is our primary (and only) AI service
    console.log('🧠 Mental Health Chatbot initialized with Gemini AI');

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

    // Response templates for common scenarios
    this.responseTemplates = {
      greeting: [
        "Hello! I'm MindBot, your AI mental health companion. I'm here to listen and support you. How are you feeling today?",
        "Hi there! I'm glad you're here. I'm MindBot, and I'm here to provide a safe space for you to share what's on your mind. What would you like to talk about?",
        "Welcome! I'm MindBot, your supportive AI companion. I'm here to listen without judgment. How can I help you today?"
      ],
      
      crisis_detected: [
        "I'm really concerned about what you're sharing with me. Your feelings are valid, and you don't have to go through this alone. Have you considered speaking with a mental health professional or calling a crisis helpline?",
        "Thank you for trusting me with these difficult feelings. I want you to know that there are people who can help you through this. Would you be willing to reach out to a crisis counselor or call the National Suicide Prevention Lifeline at 988?",
        "I hear how much pain you're in right now, and I'm worried about you. Your life has value, and there are trained professionals who can provide the immediate support you need. Can we talk about getting you connected with crisis resources?"
      ],
      
      encouragement: [
        "It takes courage to reach out and share these feelings. That's already a positive step forward.",
        "I admire your willingness to be open about your struggles. That shows real strength.",
        "You're not alone in feeling this way, and seeking support shows how much you care about your wellbeing."
      ]
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
   * Select the AI service - now always uses Gemini
   * @returns {string} Selected service ('gemini' or 'fallback')
   */
  selectAIService() {
    return geminiService.isAvailable() ? 'gemini' : 'fallback';
  }

  /**
   * Generate AI response using the best available service
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

      // Handle crisis situations immediately with fallback response
      if (nlpAnalysis.crisis.isCrisis) {
        return {
          message: this.getCrisisResponse(nlpAnalysis),
          nlpAnalysis,
          context: updatedContext,
          requiresHumanIntervention: true,
          responseType: 'crisis',
          aiService: 'crisis-fallback'
        };
      }

      // Select the best available AI service
      const selectedService = this.selectAIService();
      console.log(`🎆 Selected AI service: ${selectedService}`);

      // Use Gemini if available
      if (selectedService === 'gemini') {
        try {
          const geminiResponse = await geminiService.generateResponse(userMessage, conversationHistory, updatedContext);
          return geminiResponse;
        } catch (error) {
          console.error('Gemini failed, falling back to rule-based responses:', error.message);
          // Fall through to fallback
        }
      }

      // Fallback if no AI service available
      return {
        message: this.getFallbackResponse(nlpAnalysis, userMessage),
        nlpAnalysis,
        context: updatedContext,
        requiresHumanIntervention: nlpAnalysis.crisis.isCrisis,
        responseType: 'fallback',
        error: 'No AI services available',
        aiService: 'fallback'
      };

    } catch (error) {
      console.error('Chatbot response generation error:', error);
      
      // Ultimate fallback response
      const nlpAnalysis = nlpService.analyzeText(userMessage);
      
      return {
        message: this.getFallbackResponse(nlpAnalysis, userMessage),
        nlpAnalysis,
        context: { crisisDetected: nlpAnalysis.crisis.isCrisis },
        requiresHumanIntervention: nlpAnalysis.crisis.isCrisis,
        responseType: 'fallback',
        error: 'AI service error',
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
    const templates = this.responseTemplates.crisis_detected;
    const baseResponse = templates[Math.floor(Math.random() * templates.length)];
    
    let crisisResponse = baseResponse;
    
    // Add specific resources based on crisis indicators
    if (nlpAnalysis.crisis.indicators.some(indicator => 
      indicator.includes('suicide') || indicator.includes('kill'))) {
      crisisResponse += "\n\n🆘 **Immediate Resources:**\n";
      crisisResponse += "• National Suicide Prevention Lifeline: **988** (24/7)\n";
      crisisResponse += "• Crisis Text Line: Text **HOME** to **741741**\n";
      crisisResponse += "• Emergency Services: **911**\n\n";
      crisisResponse += "You matter, and your life has value. Please reach out to one of these resources right now.";
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
    
    if (message.includes('how are you') || message.includes('how do you feel')) {
      return "Thank you for asking! I'm here and ready to support you. More importantly, how are YOU feeling right now? I'm here to listen and help however I can.";
    }
    
    if (message.includes('stressed') || message.includes('stress') || message.includes('overwhelmed')) {
      return "I understand you're feeling stressed and overwhelmed. Let me help you manage this stress with practical strategies:\n\n🗺️ **Organize Your Stress:**\n• Write down everything that's stressing you - brain dump it all\n• Categorize: What can you control vs. what you can't\n• Focus only on what you CAN control\n\n⚙️ **Immediate Stress Relief:**\n• Take 5 deep breaths - this activates your calm response\n• Do a 5-minute walk or light stretching\n• Listen to calming music or sounds\n\n📦 **Break It Down:**\n• Pick ONE task and break it into tiny steps\n• Do just the first small step\n• Celebrate that small win!\n\n👏 **Remember:** You don't have to handle everything at once. One step at a time. What feels like the most manageable thing to start with?";
    }
    
    if (message.includes('anxious') || message.includes('anxiety') || message.includes('worried') || message.includes('nervous')) {
      return "I understand you're feeling anxious. Here are some proven techniques to help calm anxiety right now:\n\n🌬️ **Breathing Techniques:**\n• 4-7-8 Breathing: Inhale for 4, hold for 7, exhale for 8 (repeat 4 times)\n• Box Breathing: In for 4, hold for 4, out for 4, hold for 4\n\n🎯 **Grounding Techniques:**\n• 5-4-3-2-1: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste\n• Hold an ice cube or splash cold water on your face\n\n📝 **Quick Actions:**\n• Write down your worries - getting them out of your head helps\n• Do 10 jumping jacks or stretch to release physical tension\n• Listen to calming music or nature sounds\n\nAnxiety is temporary. You've handled difficult moments before, and you can handle this too. Try one technique now and let me know how it goes!";
    }
    
    if (message.includes('sad') || message.includes('depressed') || message.includes('down') || message.includes('hopeless')) {
      return "I understand you're feeling depressed, and I want to help you through this. Here are some strategies that can help when you're feeling low:\n\n✨ **Immediate Actions:**\n• Take a 10-minute walk outside - sunlight and movement can boost mood\n• Do one small task you can complete (like making your bed) for a sense of accomplishment\n• Listen to uplifting music or watch something that usually makes you smile\n\n💙 **Self-Care:**\n• Reach out to a friend or family member - connection helps\n• Practice deep breathing: 4 counts in, hold for 4, out for 6\n• Write down 3 things you're grateful for, even if they're small\n\nRemember: Depression makes everything feel harder, but these feelings will pass. You're stronger than you know. Would you like to try one of these strategies?";
    }
    
    if (message.includes('exam') || message.includes('test') || message.includes('study') || message.includes('school') || message.includes('college')) {
      return "I understand academic pressure can feel overwhelming. Here's how to manage exam stress and study more effectively:\n\n📅 **Study Strategy:**\n• Break study material into small chunks (25-minute focus sessions)\n• Take 5-minute breaks between sessions\n• Study the hardest subjects when you're most alert\n\n🧠 **Before Exams:**\n• Get 7-8 hours of sleep - your brain needs rest to perform\n• Eat a good breakfast with protein\n• Do 5 minutes of deep breathing before the exam\n\n✨ **Stress Management:**\n• Remember: One exam doesn't define your worth or future\n• Visualize yourself succeeding and staying calm\n• Focus on effort, not just results\n\n🎯 **Quick Calm-Down:** If you feel overwhelmed, try the 4-7-8 breathing technique right now. You've got this! Your education is important, but so is your mental health.";
    }
    
    if (message.includes('sleep') || message.includes('tired') || message.includes('exhausted') || message.includes('insomnia')) {
      return "Sleep issues can really affect how we feel and cope with daily challenges. It's important to address this. Have you noticed any patterns with your sleep, or is this a recent change? Good sleep is crucial for mental health.";
    }
    
    if (message.includes('friend') || message.includes('relationship') || message.includes('family') || message.includes('alone') || message.includes('lonely')) {
      return "Relationships and social connections are so important for our wellbeing. It sounds like you're dealing with something interpersonal. Would you like to share more about what's happening in your relationships?";
    }
    
    if (message.includes('angry') || message.includes('mad') || message.includes('frustrated') || message.includes('irritated')) {
      return "I can hear the frustration in your message. Anger often signals that something important to us feels threatened or isn't going as we hoped. It's okay to feel angry - these feelings are valid. What's been triggering these feelings for you?";
    }
    
    if (message.includes('help') || message.includes('support') || message.includes('advice')) {
      return "I'm honored that you're seeking support - that shows real strength and self-awareness. I'm here to listen and help however I can. What kind of support would be most helpful to you right now?";
    }
    
    if (message.includes('thank you') || message.includes('thanks')) {
      return "You're very welcome! I'm here for you. It means a lot that you're opening up and sharing with me. How are you feeling about our conversation so far?";
    }
    
    // Default context-aware responses based on sentiment
    if (nlpAnalysis.sentiment.sentiment === 'negative') {
      return "I can hear that you're going through something difficult right now. Your feelings are completely valid, and I want you to know that you don't have to face this alone. What's been the hardest part of what you're experiencing?";
    }
    
    if (nlpAnalysis.sentiment.sentiment === 'positive') {
      return "I'm glad to hear some positivity in your message! It's wonderful when we can find moments of light. I'd love to hear more about what's going well for you, or if there's anything else on your mind you'd like to discuss.";
    }
    
    // Emotion-based responses
    if (nlpAnalysis.emotions.some(e => e.emotion === 'anxiety' && e.confidence > 0.6)) {
      return "I'm picking up on some anxiety in what you've shared. That's completely understandable - anxiety is very common and you're certainly not alone in feeling this way. What would help you feel most supported right now?";
    }
    
    if (nlpAnalysis.emotions.some(e => e.emotion === 'sadness' && e.confidence > 0.6)) {
      return "I can sense some sadness in your message. Thank you for trusting me with these feelings. Sadness is a natural human emotion, though I know it can feel heavy. I'm here to listen and support you through this.";
    }
    
    // General supportive response
    return `Thank you for sharing that with me. I can hear that this matters to you, and I want you to know that I'm here to listen and support you. Your thoughts and feelings are important. What would be most helpful for you to talk about right now?`;
  }

  /**
   * Get conversation starter based on user context
   * @param {Object} userContext - User's context (mood history, risk level, etc.)
   * @returns {string} Conversation starter
   */
  getConversationStarter(userContext = {}) {
    if (userContext.riskLevel === 'high' || userContext.riskLevel === 'critical') {
      return "I've noticed you might be going through a particularly challenging time. I'm here to listen and support you. How are you feeling right now?";
    }
    
    if (userContext.recentMoodTrend === 'declining') {
      return "I see that things might have been difficult lately. I'm here to provide a safe space for you to share what's on your mind. What would you like to talk about today?";
    }
    
    if (userContext.hasRecentPositiveMoods) {
      return "It's good to see you! I hope you're having a decent day. I'm here to chat about whatever is on your mind - whether it's going well or if you're facing challenges.";
    }
    
    const greetings = this.responseTemplates.greeting;
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Analyze conversation for patterns and insights
   * @param {Array} conversationHistory - Full conversation history
   * @returns {Object} Conversation analysis
   */
  analyzeConversation(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return { patterns: [], insights: [], overallTone: 'neutral' };
    }

    const userMessages = conversationHistory.filter(msg => msg.sender === 'user');
    const allUserText = userMessages.map(msg => msg.content).join(' ');
    
    // Analyze all user messages together
    const overallAnalysis = nlpService.analyzeText(allUserText);
    
    // Track conversation patterns
    const patterns = [];
    const insights = [];
    
    // Check for recurring themes
    const themes = overallAnalysis.themes;
    if (themes.length > 0) {
      patterns.push(`Recurring themes: ${themes.join(', ')}`);
    }
    
    // Check for emotional progression
    const emotions = overallAnalysis.emotions;
    if (emotions.length > 0) {
      insights.push(`Dominant emotions detected: ${emotions.map(e => e.emotion).join(', ')}`);
    }
    
    // Check for coping mechanisms mentioned
    if (overallAnalysis.copingMechanisms.length > 0) {
      insights.push(`Positive coping strategies mentioned: ${overallAnalysis.copingMechanisms.join(', ')}`);
    }
    
    return {
      patterns,
      insights,
      overallTone: overallAnalysis.sentiment.sentiment,
      needsAttention: overallAnalysis.overallAssessment.needsAttention,
      recommendedActions: overallAnalysis.overallAssessment.recommendedActions,
      analysis: overallAnalysis
    };
  }

  /**
   * Get status of AI services
   * @returns {Object} Service status information
   */
  getServiceStatus() {
    return {
      gemini: geminiService.getServiceInfo(),
      preferredService: this.preferredService,
      selectedService: this.selectAIService(),
      aiProvider: 'Google Gemini Only'
    };
  }

  /**
   * Get coping strategy suggestions based on detected emotions
   * @param {Array} emotions - Detected emotions
   * @returns {Array} Coping strategy suggestions
   */
  getCopingStrategies(emotions) {
    const strategies = {
      anxiety: [
        "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8",
        "Ground yourself using the 5-4-3-2-1 technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
        "Progressive muscle relaxation can help release physical tension"
      ],
      depression: [
        "Even small activities can help - try taking a short walk or doing one household task",
        "Reach out to a friend or family member, even if it's just to say hello",
        "Practice gratitude by writing down one thing you're grateful for today"
      ],
      anger: [
        "Take slow, deep breaths to help calm your nervous system",
        "Try physical exercise to release built-up tension",
        "Write about your feelings to help process them"
      ],
      stress: [
        "Break down overwhelming tasks into smaller, manageable steps",
        "Take regular breaks throughout your day",
        "Practice mindfulness or meditation for even just 5 minutes"
      ]
    };

    const suggestions = [];
    emotions.forEach(emotion => {
      if (strategies[emotion.emotion]) {
        suggestions.push(...strategies[emotion.emotion]);
      }
    });

    return [...new Set(suggestions)].slice(0, 3); // Remove duplicates and limit to 3
  }
}

module.exports = new ChatbotService();