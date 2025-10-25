import React, { useState } from 'react';
import { AlertCircle, Brain, TrendingUp, CheckCircle } from 'lucide-react';

const PHQ9Assessment = ({ onComplete }) => {
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);

  // PHQ-9 Questions - Standard Depression Screening Tool
  const questions = [
    {
      id: 'interest',
      text: 'Little interest or pleasure in doing things',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'depression',
      text: 'Feeling down, depressed, or hopeless',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'sleep',
      text: 'Trouble falling or staying asleep, or sleeping too much',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'fatigue',
      text: 'Feeling tired or having little energy',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'appetite',
      text: 'Poor appetite or overeating',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'self_worth',
      text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'concentration',
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'movement',
      text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    },
    {
      id: 'self_harm',
      text: 'Thoughts that you would be better off dead, or of hurting yourself',
      description: 'Over the last 2 weeks, how often have you been bothered by this?'
    }
  ];

  // Response options with scores
  const responseOptions = [
    { value: 0, label: 'Not at all', color: 'success' },
    { value: 1, label: 'Several days', color: 'warning' },
    { value: 2, label: 'More than half the days', color: 'danger' },
    { value: 3, label: 'Nearly every day', color: 'danger' }
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
    
    let severity, description, recommendations, riskLevel;

    if (totalScore <= 4) {
      severity = 'Minimal Depression';
      description = 'Your responses suggest minimal signs of depression.';
      recommendations = ['Continue healthy habits', 'Stay connected with friends and family', 'Regular exercise and good sleep'];
      riskLevel = 'low';
    } else if (totalScore <= 9) {
      severity = 'Mild Depression';
      description = 'Your responses suggest mild depression symptoms.';
      recommendations = ['Consider speaking with a counselor', 'Practice stress management techniques', 'Maintain regular routines'];
      riskLevel = 'mild';
    } else if (totalScore <= 14) {
      severity = 'Moderate Depression';
      description = 'Your responses suggest moderate depression symptoms.';
      recommendations = ['Strongly consider professional counseling', 'Explore therapy options', 'Speak with healthcare provider'];
      riskLevel = 'moderate';
    } else if (totalScore <= 19) {
      severity = 'Moderately Severe Depression';
      description = 'Your responses suggest moderately severe depression symptoms.';
      recommendations = ['Seek professional help immediately', 'Consider medication evaluation', 'Regular therapy sessions recommended'];
      riskLevel = 'severe';
    } else {
      severity = 'Severe Depression';
      description = 'Your responses suggest severe depression symptoms.';
      recommendations = ['Seek immediate professional help', 'Contact mental health crisis line', 'Consider intensive treatment options'];
      riskLevel = 'critical';
    }

    // Check for self-harm responses
    const selfHarmScore = responses['self_harm'] || 0;
    if (selfHarmScore > 0) {
      riskLevel = 'critical';
      recommendations.unshift('⚠️ IMMEDIATE: Contact crisis helpline or emergency services');
    }

    const result = {
      totalScore,
      severity,
      description,
      recommendations,
      riskLevel,
      assessmentType: 'PHQ-9',
      date: new Date().toISOString(),
      criticalAlert: selfHarmScore > 0
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
      mild: 'text-warning-600 bg-warning-50 border-warning-200',
      moderate: 'text-danger-400 bg-danger-50 border-danger-200',
      severe: 'text-danger-600 bg-danger-100 border-danger-300',
      critical: 'text-danger-700 bg-danger-200 border-danger-400'
    };
    return colors[risk] || colors.low;
  };

  const getResponseColor = (color) => {
    const colors = {
      success: 'hover:bg-success-50 hover:border-success-300 focus:ring-success-500',
      warning: 'hover:bg-warning-50 hover:border-warning-300 focus:ring-warning-500',
      danger: 'hover:bg-danger-50 hover:border-danger-300 focus:ring-danger-500'
    };
    return colors[color];
  };

  if (isComplete && results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          {/* Critical Alert */}
          {results.criticalAlert && (
            <div className="mb-6 p-4 bg-danger-100 border border-danger-300 rounded-lg">
              <div className="flex items-center space-x-2 text-danger-700">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-bold">Immediate Support Needed</h3>
                  <p className="text-sm mt-1">
                    If you're having thoughts of self-harm, please reach out for help immediately:
                  </p>
                  <div className="mt-2 text-sm space-y-1">
                    <p>🆘 <strong>Crisis Helpline:</strong> 988 (Suicide & Crisis Lifeline)</p>
                    <p>📞 <strong>Emergency:</strong> 911 or local emergency services</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-secondary-900">PHQ-9 Assessment Results</h2>
            </div>
            
            <div className={`inline-block px-4 py-2 rounded-full border text-sm font-medium ${getRiskColor(results.riskLevel)}`}>
              {results.severity} (Score: {results.totalScore}/27)
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 text-center">
            <p className="text-lg text-secondary-700">{results.description}</p>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
              Recommended Actions
            </h3>
            <div className="space-y-3">
              {results.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Score Breakdown</h3>
            <div className="relative">
              <div className="w-full bg-secondary-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ${
                    results.riskLevel === 'low' ? 'bg-success-500' :
                    results.riskLevel === 'mild' ? 'bg-warning-500' :
                    'bg-danger-500'
                  }`}
                  style={{ width: `${Math.min((results.totalScore / 27) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-secondary-500 mt-2">
                <span>0 - Minimal</span>
                <span>5-9 - Mild</span>
                <span>10-14 - Moderate</span>
                <span>15-19 - Moderately Severe</span>
                <span>20-27 - Severe</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/book-appointment'}
            >
              Book Professional Appointment
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.location.href = '/chat'}
            >
              Talk to AI Counselor
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/resources'}
            >
              View Mental Health Resources
            </button>
          </div>
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
            <Brain className="h-8 w-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-secondary-900">PHQ-9 Depression Assessment</h2>
          </div>
          <p className="text-secondary-600">
            This questionnaire helps assess depression symptoms over the past 2 weeks
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-secondary-600 mb-2">
            <span>Progress</span>
            <span>{currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-mint-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
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
                  hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${getResponseColor(option.color)}
                  ${responses[questions[currentQuestion].id] === option.value 
                    ? 'border-primary-300 bg-primary-50' 
                    : ''
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-secondary-900">{option.label}</span>
                  <div className="w-6 h-6 rounded-full border-2 border-secondary-300 flex items-center justify-center">
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
        {currentQuestion > 0 && (
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="btn-secondary"
            >
              Previous Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PHQ9Assessment;