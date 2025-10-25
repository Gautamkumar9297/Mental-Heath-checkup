import React, { useState } from 'react';
import { Brain, Heart, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import PHQ9Assessment from '../components/assessments/PHQ9Assessment';
import GAD7Assessment from '../components/assessments/GAD7Assessment';
import GHQAssessment from '../components/assessments/GHQAssessment';

const Assessment = () => {
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState([]);

  const assessmentTools = [
    {
      id: 'phq9',
      name: 'PHQ-9 Depression Screening',
      description: 'Assess depression symptoms over the past 2 weeks using the standard PHQ-9 questionnaire.',
      icon: Brain,
      color: 'from-primary-500 to-primary-600',
      duration: '5-7 minutes',
      type: 'Depression'
    },
    {
      id: 'gad7',
      name: 'GAD-7 Anxiety Assessment',
      description: 'Evaluate anxiety levels using the Generalized Anxiety Disorder 7-item scale.',
      icon: Heart,
      color: 'from-mint-500 to-mint-600',
      duration: '3-5 minutes',
      type: 'Anxiety'
    },
    {
      id: 'ghq',
      name: 'General Health Questionnaire',
      description: 'Comprehensive mental health screening covering multiple psychological domains.',
      icon: Shield,
      color: 'from-lavender-500 to-lavender-600',
      duration: '8-10 minutes',
      type: 'General'
    }
  ];

  const handleAssessmentComplete = (result) => {
    setAssessmentResults([...assessmentResults, result]);
    setCurrentAssessment(null);
  };

  const startAssessment = (toolId) => {
    setCurrentAssessment(toolId);
  };

  if (currentAssessment === 'phq9') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setCurrentAssessment(null)}
            className="btn-secondary"
          >
            ← Back to Assessments
          </button>
        </div>
        <PHQ9Assessment onComplete={handleAssessmentComplete} />
      </div>
    );
  }

  if (currentAssessment === 'gad7') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setCurrentAssessment(null)}
            className="btn-secondary"
          >
            ← Back to Assessments
          </button>
        </div>
        <GAD7Assessment onComplete={handleAssessmentComplete} />
      </div>
    );
  }

  if (currentAssessment === 'ghq') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setCurrentAssessment(null)}
            className="btn-secondary"
          >
            ← Back to Assessments
          </button>
        </div>
        <GHQAssessment onComplete={handleAssessmentComplete} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Brain className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl font-bold text-secondary-900">Mental Health Assessment</h1>
          </div>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Take evidence-based psychological assessments to better understand your mental health. 
            These tools help identify symptoms and guide you toward appropriate support.
          </p>
        </div>

      {/* Assessment Results Summary */}
      {assessmentResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-secondary-900 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
            Recent Assessment Results
          </h2>
          <div className="grid gap-4">
            {assessmentResults.map((result, index) => (
              <div key={index} className="card border-l-4 border-l-primary-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-secondary-900">
                      {result.assessmentType} - {result.severity}
                    </h3>
                    <p className="text-secondary-600 text-sm">
                      Score: {result.totalScore} | {new Date(result.date).toLocaleDateString()}
                    </p>
                    <p className="text-secondary-700 mt-2">{result.description}</p>
                  </div>
                  {result.criticalAlert && (
                    <AlertCircle className="h-6 w-6 text-danger-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessmentTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="card hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-10 rounded-full -mr-16 -mt-16`} />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-secondary-500 bg-secondary-100 px-2 py-1 rounded-full">
                      {tool.type}
                    </span>
                    {tool.comingSoon && (
                      <div className="mt-1">
                        <span className="text-xs font-medium text-warning-600 bg-warning-100 px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-secondary-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-secondary-600 mb-4 text-sm leading-relaxed">
                  {tool.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-secondary-500 flex items-center">
                    ⏱️ {tool.duration}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => startAssessment(tool.id)}
                  disabled={tool.comingSoon}
                  className={`
                    w-full py-3 px-4 rounded-xl font-medium transition-all duration-300
                    ${tool.comingSoon 
                      ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${tool.color} text-white hover:shadow-lg transform hover:scale-[1.02] hover:shadow-lg`
                    }
                  `}
                >
                  {tool.comingSoon ? 'Coming Soon' : 'Start Assessment'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Information Section */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary-600" />
            Privacy & Confidentiality
          </h3>
          <div className="space-y-3 text-sm text-secondary-600">
            <p>• All assessment data is securely encrypted and stored</p>
            <p>• Your responses are only visible to you and authorized mental health professionals</p>
            <p>• Data is used solely for your mental health support and care</p>
            <p>• You can request data deletion at any time</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-warning-600" />
            Important Note
          </h3>
          <div className="space-y-3 text-sm text-secondary-600">
            <p>• These tools are for screening purposes only</p>
            <p>• Results do not constitute a clinical diagnosis</p>
            <p>• Please consult with a mental health professional for proper evaluation</p>
            <p>• If you're in crisis, contact emergency services immediately</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Assessment;
