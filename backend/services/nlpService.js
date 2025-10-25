const natural = require('natural');
const sentiment = require('sentiment');
const nlp = require('compromise');

class NLPService {
  constructor() {
    this.sentimentAnalyzer = new sentiment();
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
    
    // Initialize emotion keywords mapping
    this.emotionKeywords = {
      anxiety: [
        'anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'afraid',
        'terrified', 'overwhelmed', 'restless', 'uneasy', 'tense', 'frightened'
      ],
      depression: [
        'sad', 'depressed', 'hopeless', 'empty', 'worthless', 'guilty', 'tired',
        'exhausted', 'lonely', 'isolated', 'numb', 'dark', 'heavy', 'burden'
      ],
      anger: [
        'angry', 'mad', 'furious', 'irritated', 'frustrated', 'annoyed', 'rage',
        'hostile', 'bitter', 'resentful', 'aggravated', 'livid', 'outraged'
      ],
      joy: [
        'happy', 'joyful', 'excited', 'cheerful', 'delighted', 'elated', 'glad',
        'pleased', 'content', 'satisfied', 'optimistic', 'grateful', 'blessed'
      ],
      fear: [
        'scared', 'afraid', 'terrified', 'frightened', 'petrified', 'horrified',
        'intimidated', 'threatened', 'vulnerable', 'insecure', 'paranoid'
      ],
      calm: [
        'calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'composed', 'centered',
        'balanced', 'stable', 'grounded', 'zen', 'mindful', 'present'
      ],
      stress: [
        'stressed', 'pressure', 'burden', 'overwhelmed', 'stretched', 'strained',
        'exhausted', 'burned out', 'overloaded', 'demanding', 'hectic'
      ]
    };

    // Crisis indicators for immediate attention flagging
    this.crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living', 'better off dead',
      'self harm', 'hurt myself', 'cut myself', 'want to die', 'no point',
      'can\'t go on', 'hopeless', 'give up', 'overdose', 'end my life'
    ];

    // Positive coping keywords
    this.copingKeywords = [
      'meditation', 'exercise', 'therapy', 'counseling', 'support', 'help',
      'breathing', 'mindfulness', 'yoga', 'journal', 'talk', 'friend', 'family'
    ];
  }

  /**
   * Analyze sentiment of text using multiple approaches
   * @param {string} text - Text to analyze
   * @returns {Object} Sentiment analysis results
   */
  analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      return this.getDefaultSentiment();
    }

    const cleanText = text.toLowerCase().trim();
    
    // Use sentiment library for basic sentiment
    const sentimentResult = this.sentimentAnalyzer.analyze(cleanText);
    
    // Normalize sentiment score to -1 to 1 range
    const normalizedScore = Math.max(-1, Math.min(1, sentimentResult.score / 5));
    
    // Determine sentiment label
    let sentimentLabel = 'neutral';
    if (normalizedScore > 0.1) {
      sentimentLabel = 'positive';
    } else if (normalizedScore < -0.1) {
      sentimentLabel = 'negative';
    }
    
    // Calculate confidence based on absolute score
    const confidence = Math.min(1, Math.abs(normalizedScore) + 0.3);
    
    return {
      sentiment: sentimentLabel,
      score: normalizedScore,
      confidence: Math.round(confidence * 100) / 100,
      comparative: sentimentResult.comparative,
      positive: sentimentResult.positive,
      negative: sentimentResult.negative,
      tokens: sentimentResult.tokens
    };
  }

  /**
   * Detect emotions in text using keyword matching and context analysis
   * @param {string} text - Text to analyze
   * @returns {Array} Array of detected emotions with confidence scores
   */
  detectEmotions(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const cleanText = text.toLowerCase();
    const tokens = this.tokenizer.tokenize(cleanText);
    const emotions = [];

    // Check each emotion category
    Object.keys(this.emotionKeywords).forEach(emotion => {
      let matchCount = 0;
      let totalRelevance = 0;

      this.emotionKeywords[emotion].forEach(keyword => {
        if (cleanText.includes(keyword)) {
          matchCount++;
          // Weight longer, more specific keywords higher
          totalRelevance += keyword.length / 10;
        }
      });

      if (matchCount > 0) {
        // Calculate confidence based on matches and text length
        const confidence = Math.min(1, 
          (matchCount * totalRelevance) / (tokens.length * 0.1)
        );
        
        emotions.push({
          emotion,
          confidence: Math.round(confidence * 100) / 100,
          matches: matchCount
        });
      }
    });

    // Sort by confidence and return top emotions
    return emotions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Return top 3 emotions
  }

  /**
   * Check for crisis indicators in text
   * @param {string} text - Text to analyze
   * @returns {Object} Crisis assessment results
   */
  assessCrisisRisk(text) {
    if (!text || typeof text !== 'string') {
      return {
        isCrisis: false,
        riskLevel: 'low',
        indicators: [],
        confidence: 0
      };
    }

    const cleanText = text.toLowerCase();
    const foundIndicators = [];

    // Check for crisis keywords
    this.crisisKeywords.forEach(keyword => {
      if (cleanText.includes(keyword)) {
        foundIndicators.push(keyword);
      }
    });

    // Assess risk level
    let riskLevel = 'low';
    let isCrisis = false;
    let confidence = 0;

    if (foundIndicators.length > 0) {
      confidence = Math.min(1, foundIndicators.length * 0.3);
      
      if (foundIndicators.length >= 3) {
        riskLevel = 'critical';
        isCrisis = true;
      } else if (foundIndicators.length >= 2) {
        riskLevel = 'high';
        isCrisis = true;
      } else if (foundIndicators.length >= 1) {
        riskLevel = 'moderate';
        // Check sentiment to determine if crisis intervention needed
        const sentimentResult = this.analyzeSentiment(text);
        if (sentimentResult.sentiment === 'negative' && sentimentResult.confidence > 0.7) {
          isCrisis = true;
        }
      }
    }

    return {
      isCrisis,
      riskLevel,
      indicators: foundIndicators,
      confidence: Math.round(confidence * 100) / 100
    };
  }

  /**
   * Identify coping mechanisms mentioned in text
   * @param {string} text - Text to analyze
   * @returns {Array} Array of identified coping mechanisms
   */
  identifyCopingMechanisms(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const cleanText = text.toLowerCase();
    const foundCoping = [];

    this.copingKeywords.forEach(keyword => {
      if (cleanText.includes(keyword)) {
        foundCoping.push(keyword);
      }
    });

    return [...new Set(foundCoping)]; // Remove duplicates
  }

  /**
   * Extract key themes and topics from text
   * @param {string} text - Text to analyze
   * @returns {Array} Array of key themes
   */
  extractThemes(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    try {
      const doc = nlp(text);
      
      // Extract nouns and adjectives as potential themes
      const nouns = doc.nouns().out('array');
      const adjectives = doc.adjectives().out('array');
      
      // Combine and filter relevant themes
      const themes = [...nouns, ...adjectives]
        .filter(word => word.length > 3) // Filter short words
        .filter(word => !['this', 'that', 'with', 'have', 'been', 'will'].includes(word))
        .slice(0, 5); // Limit to top 5 themes

      return [...new Set(themes)]; // Remove duplicates
    } catch (error) {
      console.error('Theme extraction error:', error);
      return [];
    }
  }

  /**
   * Comprehensive text analysis combining all NLP features
   * @param {string} text - Text to analyze
   * @param {Object} options - Analysis options
   * @returns {Object} Complete analysis results
   */
  analyzeText(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return this.getDefaultAnalysis();
    }

    const {
      includeSentiment = true,
      includeEmotions = true,
      includeCrisisAssessment = true,
      includeCoping = true,
      includeThemes = true
    } = options;

    const analysis = {
      text: text.substring(0, 500), // Limit stored text for privacy
      textLength: text.length,
      processedAt: new Date().toISOString()
    };

    try {
      if (includeSentiment) {
        analysis.sentiment = this.analyzeSentiment(text);
      }

      if (includeEmotions) {
        analysis.emotions = this.detectEmotions(text);
      }

      if (includeCrisisAssessment) {
        analysis.crisis = this.assessCrisisRisk(text);
      }

      if (includeCoping) {
        analysis.copingMechanisms = this.identifyCopingMechanisms(text);
      }

      if (includeThemes) {
        analysis.themes = this.extractThemes(text);
      }

      // Add overall assessment
      analysis.overallAssessment = this.generateOverallAssessment(analysis);

    } catch (error) {
      console.error('NLP Analysis error:', error);
      analysis.error = 'Analysis failed';
    }

    return analysis;
  }

  /**
   * Generate an overall assessment based on all analysis results
   * @param {Object} analysis - Complete analysis results
   * @returns {Object} Overall assessment
   */
  generateOverallAssessment(analysis) {
    const assessment = {
      needsAttention: false,
      recommendedActions: [],
      overallMood: 'neutral',
      supportLevel: 'standard'
    };

    // Check for crisis indicators
    if (analysis.crisis && analysis.crisis.isCrisis) {
      assessment.needsAttention = true;
      assessment.recommendedActions.push('immediate_intervention');
      assessment.supportLevel = 'crisis';
    }

    // Assess overall mood based on sentiment and emotions
    if (analysis.sentiment) {
      if (analysis.sentiment.sentiment === 'negative' && analysis.sentiment.confidence > 0.6) {
        assessment.overallMood = 'concerning';
        if (!assessment.needsAttention) {
          assessment.recommendedActions.push('follow_up');
          assessment.supportLevel = 'elevated';
        }
      } else if (analysis.sentiment.sentiment === 'positive') {
        assessment.overallMood = 'positive';
      }
    }

    // Check for positive coping mechanisms
    if (analysis.copingMechanisms && analysis.copingMechanisms.length > 0) {
      assessment.recommendedActions.push('reinforce_coping');
    }

    // Check for specific emotions requiring attention
    if (analysis.emotions) {
      const concerningEmotions = ['depression', 'anxiety', 'fear'];
      const hasComcerningEmotions = analysis.emotions.some(emotion => 
        concerningEmotions.includes(emotion.emotion) && emotion.confidence > 0.6
      );

      if (hasComcerningEmotions) {
        assessment.recommendedActions.push('emotional_support');
        if (assessment.supportLevel === 'standard') {
          assessment.supportLevel = 'elevated';
        }
      }
    }

    return assessment;
  }

  /**
   * Get default sentiment analysis result
   * @returns {Object} Default sentiment result
   */
  getDefaultSentiment() {
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
      comparative: 0,
      positive: [],
      negative: [],
      tokens: []
    };
  }

  /**
   * Get default analysis result
   * @returns {Object} Default analysis result
   */
  getDefaultAnalysis() {
    return {
      text: '',
      textLength: 0,
      processedAt: new Date().toISOString(),
      sentiment: this.getDefaultSentiment(),
      emotions: [],
      crisis: {
        isCrisis: false,
        riskLevel: 'low',
        indicators: [],
        confidence: 0
      },
      copingMechanisms: [],
      themes: [],
      overallAssessment: {
        needsAttention: false,
        recommendedActions: [],
        overallMood: 'neutral',
        supportLevel: 'standard'
      }
    };
  }
}

module.exports = new NLPService();