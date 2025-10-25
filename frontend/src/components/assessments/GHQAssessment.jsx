import React, { useState } from 'react';
import { Activity, AlertCircle, TrendingUp, CheckCircle, Zap } from 'lucide-react';

const GHQAssessment = ({ onComplete }) => {
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);

  // GHQ-12 Questions - General Health Questionnaire (Short Form)
  const questions = [
    {
      id: 'concentrate',
      text: 'Been able to concentrate on whatever you\'re doing?',
      description: 'Over the past few weeks, have you...',
      positive: true
    },
    {
      id: 'sleep_loss',
      text: 'Lost much sleep over worry?',
      description: 'Over the past few weeks, have you...',
      positive: false
    },
    {
      id: 'useful_role',
      text: 'Felt that you are playing a useful part in things?',
      description: 'Over the past few weeks, have you...',
      positive: true
    },
    {
      id: 'decision_making',
      text: 'Felt capable of making decisions about things?',
      description: 'Over the past few weeks, have you...',
      positive: true
    },
    {
      id: 'strain',
      text: 'Felt constantly under strain?',
      description: 'Over the past few weeks, have you...',
      positive: false
    },
    {
      id: 'problems_overcome',
      text: 'Felt you couldn\'t overcome your difficulties?',
      description: 'Over the past few weeks, have you...',
      positive: false
    },
    {
      id: 'enjoy_activities',
      text: 'Been able to enjoy your normal day-to-day activities?',
      description: 'Over the past few weeks, have you...',
      positive: true
    },
    {
      id: 'face_problems',
      text: 'Been able to face up to your problems?',
      description: 'Over the past few weeks, have you...',
      positive: true
    },
    {
      id: 'unhappy_depressed',
      text: 'Been feeling unhappy and depressed?',
      description: 'Over the past few weeks, have you...',
      positive: false
    },
    {
      id: 'confidence',
      text: 'Been losing confidence in yourself?',
      description: 'Over the past few weeks, have you...',
      positive: false
    },
    {
      id: 'worthless',
      text: 'Been thinking of yourself as a worthless person?',
      description: 'Over the past few weeks, have you...',
      positive: false
    },
    {
      id: 'happy',
      text: 'Been feeling reasonably happy, all things considered?',
      description: 'Over the past few weeks, have you...',
      positive: true
    }
  ];

  // Response options for positive and negative items
  const getResponseOptions = (isPositive) => {
    if (isPositive) {
      return [
        { value: 0, label: 'More so than usual', color: 'success', description: 'Better than normal' },
        { value: 0, label: 'Same as usual', color: 'info', description: 'Your normal level' },
        { value: 1, label: 'Less so than usual', color: 'warning', description: 'Below normal' },
        { value: 1, label: 'Much less than usual', color: 'danger', description: 'Much worse than normal' }
      ];
    } else {
      return [
        { value: 0, label: 'Not at all', color: 'success', description: 'No problems' },
        { value: 0, label: 'No more than usual', color: 'info', description: 'Normal level' },
        { value: 1, label: 'Rather more than usual', color: 'warning', description: 'More than normal' },
        { value: 1, label: 'Much more than usual', color: 'danger', description: 'Much more than normal' }
      ];
    }
  };

  const handleResponse = (questionId, value) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // Calculate results
      calculateResults(newResponses);
    }
  };

  const calculateResults = (responses) => {
    const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
    
    let interpretation, description, recommendations, riskLevel, wellbeingLevel;

    if (totalScore <= 2) {
      interpretation = 'Good Mental Wellbeing';
      wellbeingLevel = 'Excellent';
      description = 'Your responses suggest good psychological wellbeing with no significant mental health concerns.';
      recommendations = [
        'Continue maintaining your current healthy habits and coping strategies',
        'Keep up with regular social connections and activities you enjoy',
        'Monitor your wellbeing during stressful periods',
        'Consider sharing your positive coping strategies with others'
      ];
      riskLevel = 'low';
    } else if (totalScore <= 4) {
      interpretation = 'Mild Mental Health Concerns';
      wellbeingLevel = 'Good';
      description = 'Your responses suggest some mild psychological concerns that may benefit from attention.';
      recommendations = [
        'Pay attention to stress management and self-care',
        'Consider talking to friends, family, or a counselor about any concerns',
        'Practice stress reduction techniques like mindfulness or exercise',
        'Monitor your symptoms and seek help if they worsen'
      ];
      riskLevel = 'mild';
    } else if (totalScore <= 6) {
      interpretation = 'Moderate Mental Health Concerns';
      wellbeingLevel = 'Fair';
      description = 'Your responses suggest moderate psychological distress that would benefit from professional attention.';
      recommendations = [
        'Consider speaking with a mental health professional or counselor',
        'Implement structured stress management and wellness activities',
        'Reach out to your support network for help and guidance',
        'Consider whether recent life changes or stresses may be affecting you'
      ];
      riskLevel = 'moderate';
    } else {
      interpretation = 'Significant Mental Health Concerns';
      wellbeingLevel = 'Needs Attention';
      description = 'Your responses suggest significant psychological distress that requires professional support.';
      recommendations = [
        'Seek professional mental health support as soon as possible',
        'Consider comprehensive assessment and treatment planning',
        'Reach out to trusted friends and family for support',
        'Explore both therapy and medical treatment options if recommended'
      ];
      riskLevel = 'high';
    }

    // Check for specific concerning responses
    const concerningItems = ['worthless', 'confidence', 'unhappy_depressed', 'problems_overcome'];
    const concerningResponses = concerningItems.filter(item => responses[item] === 1);
    
    if (concerningResponses.length >= 2) {
      recommendations.unshift('⚠️ Consider discussing feelings of self-worth and mood with a professional');
    }

    const result = {
      totalScore,
      interpretation,
      wellbeingLevel,
      description,
      recommendations,
      riskLevel,
      assessmentType: 'GHQ-12',
      date: new Date().toISOString(),
      needsAttention: totalScore >= 4,
      concerningAreas: concerningResponses
    };

    setResults(result);
    setIsComplete(true);
    
    if (onComplete) {
      onComplete(result);
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'text-success-600 bg-success-50 border-success-200',
      mild: 'text-primary-600 bg-primary-50 border-primary-200',
      moderate: 'text-warning-600 bg-warning-50 border-warning-200',
      high: 'text-danger-600 bg-danger-100 border-danger-300'
    };
    return colors[risk] || colors.low;
  };

  const getResponseColor = (color) => {
    const colors = {
      success: 'hover:bg-success-50 hover:border-success-300 focus:ring-success-500',
      info: 'hover:bg-primary-50 hover:border-primary-300 focus:ring-primary-500',
      warning: 'hover:bg-warning-50 hover:border-warning-300 focus:ring-warning-500',
      danger: 'hover:bg-danger-50 hover:border-danger-300 focus:ring-danger-500'
    };
    return colors[color];
  };

  if (isComplete && results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Activity className="h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-secondary-900">GHQ-12 Assessment Results</h2>
            </div>
            
            <div className={`inline-block px-4 py-2 rounded-full border text-sm font-medium ${getRiskColor(results.riskLevel)}`}>
              {results.interpretation} (Score: {results.totalScore}/12)
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 text-center">
            <p className="text-lg text-secondary-700">{results.description}</p>
          </div>

          {/* Wellbeing Level Visualization */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Overall Wellbeing Level</h3>
            <div className="relative">
              <div className="w-full bg-secondary-200 rounded-full h-6">
                <div 
                  className={`h-6 rounded-full transition-all duration-1000 flex items-center justify-center text-white text-sm font-medium ${
                    results.riskLevel === 'low' ? 'bg-gradient-to-r from-success-400 to-success-500' :
                    results.riskLevel === 'mild' ? 'bg-gradient-to-r from-primary-400 to-primary-500' :
                    results.riskLevel === 'moderate' ? 'bg-gradient-to-r from-warning-400 to-warning-500' :
                    'bg-gradient-to-r from-danger-400 to-danger-500'
                  }`}
                  style={{ width: `${Math.max((12 - results.totalScore) / 12 * 100, 15)}%` }}
                >
                  {results.wellbeingLevel}
                </div>
              </div>
              <div className="flex justify-between text-xs text-secondary-500 mt-2">
                <span>0-2: Excellent</span>
                <span>3-4: Good</span>
                <span>5-6: Fair</span>
                <span>7+: Needs Attention</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
              Personalized Recommendations
            </h3>
            <div className="space-y-3">
              {results.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-primary-50 to-mint-50 rounded-lg border border-primary-100">
                  <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wellbeing Tips */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-mint-600" />
              General Wellbeing Strategies
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-success-50 rounded-lg border border-success-100">
                <h4 className="font-semibold text-success-900 mb-2">🌱 Build Resilience</h4>
                <p className="text-sm text-success-700">Develop problem-solving skills, maintain perspective, and practice flexibility in facing challenges.</p>
              </div>
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                <h4 className="font-semibold text-primary-900 mb-2">🤝 Social Support</h4>
                <p className="text-sm text-primary-700">Maintain meaningful relationships, seek support when needed, and contribute to your community.</p>
              </div>
              <div className="p-4 bg-mint-50 rounded-lg border border-mint-100">
                <h4 className="font-semibold text-mint-900 mb-2">⚖️ Work-Life Balance</h4>
                <p className="text-sm text-mint-700">Set boundaries, prioritize self-care, and make time for activities that bring you joy.</p>
              </div>
              <div className="p-4 bg-lavender-50 rounded-lg border border-lavender-100">
                <h4 className="font-semibold text-lavender-900 mb-2">🎯 Purpose & Meaning</h4>
                <p className="text-sm text-lavender-700">Identify your values, set meaningful goals, and engage in activities that align with your purpose.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/chat'}
            >
              Talk to AI Wellness Coach
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.location.href = '/book-appointment'}
            >
              Book Professional Consultation
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/resources'}
            >
              Explore Wellness Resources
            </button>
          </div>

          {/* High Risk Alert */}
          {results.riskLevel === 'high' && (
            <div className="mt-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <div className="flex items-start space-x-2 text-danger-700">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Important Notice</h3>
                  <p className="text-sm mb-2">Your responses indicate significant distress that would benefit from professional support.</p>
                  <div className="text-sm space-y-1">
                    <p>📞 <strong>Student Counseling:</strong> Contact your college counseling center</p>
                    <p>🆘 <strong>Crisis Support:</strong> 988 (Mental Health Crisis Line)</p>
                    <p>🏥 <strong>Emergency:</strong> 911 or local emergency services if in immediate danger</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentResponseOptions = getResponseOptions(questions[currentQuestion].positive);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Activity className="h-8 w-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-secondary-900">GHQ-12 General Health Assessment</h2>
          </div>
          <p className="text-secondary-600">
            This questionnaire assesses your general psychological wellbeing over recent weeks
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-secondary-600 mb-2">
            <span>Progress</span>
            <span>{currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-mint-500 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="mb-6 p-6 bg-gradient-to-r from-primary-50 to-mint-50 rounded-xl border border-primary-100">
            <h3 className="text-lg font-semibold text-secondary-900 mb-3 flex items-center">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                {currentQuestion + 1}
              </div>
              {questions[currentQuestion].description}
            </h3>
            <p className="text-xl text-secondary-800 font-medium">
              {questions[currentQuestion].text}
            </p>
          </div>

          {/* Response Options */}
          <div className="space-y-3">
            {currentResponseOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(questions[currentQuestion].id, option.value)}
                className={`
                  w-full p-4 text-left border-2 border-secondary-200 rounded-xl transition-all duration-200
                  hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 group
                  ${getResponseColor(option.color)}
                  ${responses[questions[currentQuestion].id] === option.value 
                    ? 'border-primary-300 bg-primary-50 shadow-md' 
                    : ''
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-secondary-900 block">{option.label}</span>
                    <span className="text-sm text-secondary-600">{option.description}</span>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-secondary-300 flex items-center justify-center group-hover:border-primary-400 transition-colors">
                    {responses[questions[currentQuestion].id] === option.value && (
                      <div className="w-3 h-3 rounded-full bg-primary-600" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {currentQuestion > 0 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="btn-secondary"
            >
              ← Previous Question
            </button>
          ) : (
            <div />
          )}
          
          <div className="text-sm text-secondary-500 flex items-center">
            {currentQuestion === questions.length - 1 && Object.keys(responses).length === questions.length && (
              <span className="text-primary-600 font-medium">✓ Ready to calculate results</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GHQAssessment;