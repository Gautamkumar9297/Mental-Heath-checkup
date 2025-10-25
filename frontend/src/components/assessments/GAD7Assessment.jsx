import React, { useState } from 'react';
import { Heart, AlertTriangle, TrendingUp, CheckCircle, Shield } from 'lucide-react';

const GAD7Assessment = ({ onComplete }) => {
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);

  // GAD-7 Questions - Standard Anxiety Screening Tool
  const questions = [
    {
      id: 'nervousness',
      text: 'Feeling nervous, anxious, or on edge',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'worry_control',
      text: 'Not being able to stop or control worrying',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'worry_too_much',
      text: 'Worrying too much about different things',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'trouble_relaxing',
      text: 'Trouble relaxing',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'restlessness',
      text: 'Being so restless that it is hard to sit still',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'irritability',
      text: 'Becoming easily annoyed or irritable',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'fear_awful',
      text: 'Feeling afraid, as if something awful might happen',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    }
  ];

  // Response options with scores
  const responseOptions = [
    { value: 0, label: 'Not at all', color: 'success', description: 'This hasn\'t bothered you' },
    { value: 1, label: 'Several days', color: 'info', description: 'Occasional concern' },
    { value: 2, label: 'More than half the days', color: 'warning', description: 'Frequent worry' },
    { value: 3, label: 'Nearly every day', color: 'danger', description: 'Persistent anxiety' }
  ];

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
    
    let severity, description, recommendations, riskLevel, anxietyLevel;

    if (totalScore <= 4) {
      severity = 'Minimal Anxiety';
      anxietyLevel = 'Minimal';
      description = 'Your responses suggest minimal signs of anxiety.';
      recommendations = [
        'Continue maintaining healthy stress management habits',
        'Practice regular mindfulness or meditation',
        'Keep up with regular exercise and social connections',
        'Monitor stress levels during challenging periods'
      ];
      riskLevel = 'low';
    } else if (totalScore <= 9) {
      severity = 'Mild Anxiety';
      anxietyLevel = 'Mild';
      description = 'Your responses suggest mild anxiety symptoms that may benefit from attention.';
      recommendations = [
        'Consider learning stress management techniques',
        'Try deep breathing exercises and progressive muscle relaxation',
        'Maintain regular sleep schedule and limit caffeine',
        'Consider speaking with a counselor if symptoms persist'
      ];
      riskLevel = 'mild';
    } else if (totalScore <= 14) {
      severity = 'Moderate Anxiety';
      anxietyLevel = 'Moderate';
      description = 'Your responses suggest moderate anxiety symptoms that would benefit from professional support.';
      recommendations = [
        'Strongly consider professional counseling or therapy',
        'Learn cognitive-behavioral techniques for managing anxiety',
        'Practice regular relaxation and mindfulness exercises',
        'Discuss symptoms with your healthcare provider'
      ];
      riskLevel = 'moderate';
    } else {
      severity = 'Severe Anxiety';
      anxietyLevel = 'Severe';
      description = 'Your responses suggest severe anxiety symptoms that require professional attention.';
      recommendations = [
        'Seek immediate professional mental health support',
        'Consider therapy and/or medication evaluation',
        'Implement comprehensive anxiety management strategies',
        'Build a strong support network of family and friends'
      ];
      riskLevel = 'severe';
    }

    // Check for high scores on specific domains
    const fearScore = responses['fear_awful'] || 0;
    const worryControlScore = responses['worry_control'] || 0;
    
    if (fearScore >= 2 || worryControlScore >= 2) {
      recommendations.unshift('⚠️ Consider discussing panic symptoms with a mental health professional');
    }

    const result = {
      totalScore,
      severity,
      anxietyLevel,
      description,
      recommendations,
      riskLevel,
      assessmentType: 'GAD-7',
      date: new Date().toISOString(),
      needsAttention: totalScore >= 10
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
      mild: 'text-mint-600 bg-mint-50 border-mint-200',
      moderate: 'text-warning-600 bg-warning-50 border-warning-200',
      severe: 'text-danger-600 bg-danger-100 border-danger-300'
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
              <Heart className="h-8 w-8 text-mint-600" />
              <h2 className="text-2xl font-bold text-secondary-900">GAD-7 Assessment Results</h2>
            </div>
            
            <div className={`inline-block px-4 py-2 rounded-full border text-sm font-medium ${getRiskColor(results.riskLevel)}`}>
              {results.severity} (Score: {results.totalScore}/21)
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 text-center">
            <p className="text-lg text-secondary-700">{results.description}</p>
          </div>

          {/* Anxiety Level Visualization */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Anxiety Level Assessment</h3>
            <div className="relative">
              <div className="w-full bg-secondary-200 rounded-full h-6">
                <div 
                  className={`h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-4 text-white text-sm font-medium ${
                    results.riskLevel === 'low' ? 'bg-gradient-to-r from-success-400 to-success-500' :
                    results.riskLevel === 'mild' ? 'bg-gradient-to-r from-mint-400 to-mint-500' :
                    results.riskLevel === 'moderate' ? 'bg-gradient-to-r from-warning-400 to-warning-500' :
                    'bg-gradient-to-r from-danger-400 to-danger-500'
                  }`}
                  style={{ width: `${Math.min((results.totalScore / 21) * 100, 100)}%` }}
                >
                  {results.totalScore > 3 && results.anxietyLevel}
                </div>
              </div>
              <div className="flex justify-between text-xs text-secondary-500 mt-2">
                <span>0-4: Minimal</span>
                <span>5-9: Mild</span>
                <span>10-14: Moderate</span>
                <span>15-21: Severe</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-mint-600" />
              Personalized Recommendations
            </h3>
            <div className="space-y-3">
              {results.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-mint-50 to-primary-50 rounded-lg border border-mint-100">
                  <CheckCircle className="h-5 w-5 text-mint-600 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anxiety Management Tips */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary-600" />
              Quick Anxiety Relief Techniques
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                <h4 className="font-semibold text-primary-900 mb-2">🌬️ 4-7-8 Breathing</h4>
                <p className="text-sm text-primary-700">Inhale for 4, hold for 7, exhale for 8. Repeat 3-4 cycles.</p>
              </div>
              <div className="p-4 bg-mint-50 rounded-lg border border-mint-100">
                <h4 className="font-semibold text-mint-900 mb-2">🧘 5-4-3-2-1 Grounding</h4>
                <p className="text-sm text-mint-700">Notice 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.</p>
              </div>
              <div className="p-4 bg-lavender-50 rounded-lg border border-lavender-100">
                <h4 className="font-semibold text-lavender-900 mb-2">💭 Thought Challenging</h4>
                <p className="text-sm text-lavender-700">Ask: "Is this thought helpful? Is it realistic? What would I tell a friend?"</p>
              </div>
              <div className="p-4 bg-sage-50 rounded-lg border border-sage-100">
                <h4 className="font-semibold text-sage-900 mb-2">🚶 Progressive Muscle Relaxation</h4>
                <p className="text-sm text-sage-700">Tense and release each muscle group for 5 seconds, starting with toes.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/chat'}
            >
              Talk to AI Anxiety Coach
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.location.href = '/book-appointment'}
            >
              Schedule Professional Support
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/resources'}
            >
              Anxiety Management Resources
            </button>
          </div>

          {/* Crisis Resources */}
          {results.riskLevel === 'severe' && (
            <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-start space-x-2 text-warning-700">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Additional Support Resources</h3>
                  <div className="text-sm space-y-1">
                    <p>📞 <strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                    <p>🆘 <strong>National Suicide Prevention Lifeline:</strong> 988</p>
                    <p>🏥 <strong>Emergency Services:</strong> 911 for immediate crisis</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-mint-600 animate-pulse-slow" />
            <h2 className="text-2xl font-bold text-secondary-900">GAD-7 Anxiety Assessment</h2>
          </div>
          <p className="text-secondary-600">
            This questionnaire measures anxiety levels over the past 2 weeks using the clinically validated GAD-7 scale
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
              className="bg-gradient-to-r from-mint-500 to-primary-500 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="mb-6 p-6 bg-gradient-to-r from-mint-50 to-primary-50 rounded-xl border border-mint-100">
            <h3 className="text-lg font-semibold text-secondary-900 mb-3 flex items-center">
              <div className="w-8 h-8 bg-mint-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
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
            {responseOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleResponse(questions[currentQuestion].id, option.value)}
                className={`
                  w-full p-4 text-left border-2 border-secondary-200 rounded-xl transition-all duration-200
                  hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 group
                  ${getResponseColor(option.color)}
                  ${responses[questions[currentQuestion].id] === option.value 
                    ? 'border-mint-300 bg-mint-50 shadow-md' 
                    : ''
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-secondary-900 block">{option.label}</span>
                    <span className="text-sm text-secondary-600">{option.description}</span>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-secondary-300 flex items-center justify-center group-hover:border-mint-400 transition-colors">
                    {responses[questions[currentQuestion].id] === option.value && (
                      <div className="w-3 h-3 rounded-full bg-mint-600" />
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
              <span className="text-mint-600 font-medium">✓ Ready to calculate results</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GAD7Assessment;