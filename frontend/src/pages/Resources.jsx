import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  Download, 
  ExternalLink, 
  Phone, 
  AlertTriangle,
  Heart,
  Brain,
  Music,
  FileText,
  Video,
  Headphones,
  Globe,
  Clock,
  Star,
  Search,
  Filter
} from 'lucide-react';

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'articles', name: 'Articles & Guides', icon: FileText },
    { id: 'videos', name: 'Videos', icon: Video },
    { id: 'audio', name: 'Audio & Meditation', icon: Headphones },
    { id: 'emergency', name: 'Emergency Support', icon: AlertTriangle },
    { id: 'tools', name: 'Self-Help Tools', icon: Brain }
  ];

  const languages = [
    { code: 'english', name: 'English' },
    { code: 'hindi', name: 'हिंदी (Hindi)' },
    { code: 'tamil', name: 'தமிழ் (Tamil)' },
    { code: 'bengali', name: 'বাংলা (Bengali)' },
    { code: 'marathi', name: 'मराठी (Marathi)' },
    { code: 'telugu', name: 'తెలుగు (Telugu)' }
  ];

  const emergencyContacts = [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support',
      type: 'crisis'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free 24/7 crisis counseling',
      type: 'text'
    },
    {
      name: 'SAMHSA National Helpline',
      number: '1-800-662-HELP',
      description: 'Mental health and substance abuse',
      type: 'helpline'
    },
    {
      name: 'Campus Counseling Center',
      number: 'Contact your institution',
      description: 'On-campus mental health services',
      type: 'campus'
    }
  ];

  const resources = [
    // Articles & Guides
    {
      id: 1,
      title: 'Understanding Anxiety in College Students',
      description: 'Comprehensive guide on recognizing and managing anxiety during academic years.',
      category: 'articles',
      type: 'PDF Guide',
      duration: '15 min read',
      language: 'english',
      rating: 4.8,
      tags: ['anxiety', 'college', 'coping strategies']
    },
    {
      id: 2,
      title: 'Depression और छात्र जीवन',
      description: 'अवसाद को समझना और उससे निपटने के तरीके - हिंदी में विस्तृत गाइड।',
      category: 'articles',
      type: 'Article',
      duration: '12 min read',
      language: 'hindi',
      rating: 4.6,
      tags: ['depression', 'hindi', 'student life']
    },
    {
      id: 3,
      title: 'মানসিক স্বাস্থ্য এবং পড়াশোনার চাপ',
      description: 'শিক্ষার্থীদের মানসিক স্বাস্থ্য রক্ষার উপায় এবং পড়াশোনার চাপ সামলানোর কৌশল।',
      category: 'articles',
      type: 'Guide',
      duration: '10 min read',
      language: 'bengali',
      rating: 4.7,
      tags: ['mental health', 'bengali', 'academic stress']
    },
    
    // Videos
    {
      id: 4,
      title: 'Breathing Techniques for Instant Calm',
      description: 'Learn 5 powerful breathing exercises to reduce anxiety and stress immediately.',
      category: 'videos',
      type: 'Video Tutorial',
      duration: '8 minutes',
      language: 'english',
      rating: 4.9,
      tags: ['breathing', 'relaxation', 'anxiety relief']
    },
    {
      id: 5,
      title: 'தியானம் மற்றும் மன அமைதி',
      description: 'தினசரி தியான பயிற்சிகள் மற்றும் மன அமைதிக்கான வழிமுறைகள்.',
      category: 'videos',
      type: 'Meditation Video',
      duration: '15 minutes',
      language: 'tamil',
      rating: 4.8,
      tags: ['meditation', 'tamil', 'peace of mind']
    },
    {
      id: 6,
      title: 'Mindfulness for Students',
      description: 'Practical mindfulness techniques specifically designed for college students.',
      category: 'videos',
      type: 'Educational Video',
      duration: '12 minutes',
      language: 'english',
      rating: 4.7,
      tags: ['mindfulness', 'students', 'focus']
    },

    // Audio & Meditation
    {
      id: 7,
      title: 'Progressive Muscle Relaxation',
      description: 'Guided audio session for deep muscle relaxation and stress relief.',
      category: 'audio',
      type: 'Audio Guide',
      duration: '20 minutes',
      language: 'english',
      rating: 4.9,
      tags: ['relaxation', 'muscle tension', 'guided audio']
    },
    {
      id: 8,
      title: 'शांति और ध्यान संगीत',
      description: 'शांतिदायक संगीत और प्राकृतिक आवाज़ों का संग्रह मन की शांति के लिए।',
      category: 'audio',
      type: 'Music & Sounds',
      duration: '30 minutes',
      language: 'hindi',
      rating: 4.6,
      tags: ['peaceful music', 'hindi', 'meditation']
    },
    {
      id: 9,
      title: 'Sleep Stories for Better Rest',
      description: 'Calming bedtime stories to help with insomnia and improve sleep quality.',
      category: 'audio',
      type: 'Sleep Aid',
      duration: '25 minutes',
      language: 'english',
      rating: 4.8,
      tags: ['sleep', 'insomnia', 'bedtime stories']
    },

    // Self-Help Tools
    {
      id: 10,
      title: 'Daily Mood Tracker Worksheet',
      description: 'Printable worksheet to track daily moods, triggers, and coping strategies.',
      category: 'tools',
      type: 'Worksheet',
      duration: 'Self-paced',
      language: 'english',
      rating: 4.5,
      tags: ['mood tracking', 'worksheet', 'self-assessment']
    },
    {
      id: 11,
      title: 'Stress Management Checklist',
      description: 'Daily and weekly checklist for managing academic and personal stress.',
      category: 'tools',
      type: 'Checklist',
      duration: 'Self-paced',
      language: 'english',
      rating: 4.7,
      tags: ['stress management', 'checklist', 'planning']
    },
    {
      id: 12,
      title: 'मानसिक स्वास्थ्य डायरी',
      description: 'दैनिक भावनाओं और विचारों को रिकॉर्ड करने के लिए डिजिटल डायरी टेम्प्लेट।',
      category: 'tools',
      type: 'Digital Template',
      duration: 'Self-paced',
      language: 'hindi',
      rating: 4.4,
      tags: ['diary', 'hindi', 'emotional tracking']
    },

    // Telugu Resources
    {
      id: 13,
      title: 'విద్యార్థుల మానసిక ఆరోగ్యం మరియు ఒత్తిడి నిర్వహణ',
      description: 'కళాశాల జీవితంలో ఒత్తిడిని ఎదుర్కోవడం మరియు మానసిక ఆరోగ్యాన్ని కాపాడుకోవడానికి వ్యూహాలు మరియు మార్గదర్శకాలు।',
      category: 'articles',
      type: 'PDF Guide',
      duration: '18 min read',
      language: 'telugu',
      rating: 4.7,
      tags: ['stress management', 'telugu', 'student mental health']
    },
    {
      id: 14,
      title: 'దిగులు మరియు దాని నుంచి బయటపడటం',
      description: 'దిగులు లక్షణాలను గుర్తించడం, అర్థం చేసుకోవడం మరియు వైద్య సహాయంతో పాటు స్వయం సహాయ పద్ధతులు।',
      category: 'articles',
      type: 'Article',
      duration: '14 min read',
      language: 'telugu',
      rating: 4.8,
      tags: ['depression', 'telugu', 'mental health awareness']
    },
    {
      id: 15,
      title: 'పరీక్షల భయం మరియు ఆందోళనను అధిగమించడం',
      description: 'పరీక్షల సమయంలో వచ్చే భయం, ఆందోళనను నియంత్రించడానికి ప్రభావకరమైన పద్ధతులు మరియు మానసిక తయారీ టిప్స్।',
      category: 'articles',
      type: 'Guide',
      duration: '12 min read',
      language: 'telugu',
      rating: 4.6,
      tags: ['exam anxiety', 'telugu', 'coping strategies']
    },
    {
      id: 16,
      title: 'ధ్యానం మరియు శ్వాస వ్యాయామాలు',
      description: 'తెలుగులో వివరించిన దైనందిన ధ్యాన పద్ధతులు, శ్వాస వ్యాయామాలు మరియు మానసిక శాంతి కోసం యోగా విద్యలు।',
      category: 'videos',
      type: 'Meditation Video',
      duration: '20 minutes',
      language: 'telugu',
      rating: 4.9,
      tags: ['meditation', 'telugu', 'breathing exercises']
    },
    {
      id: 17,
      title: 'మైండ్‌ఫుల్‌నెస్ మరియు దృష్టి కేంద్రీకరణ',
      description: 'విద్యార్థులకు అనువైన మైండ్‌ఫుల్‌నెస్ టెక్నిక్‌లు, దృష్టి కేంద్రీకరణ వ్యాయామాలు మరియు ప్రస్తుత క్షణంలో జీవించడం.',
      category: 'videos',
      type: 'Educational Video',
      duration: '15 minutes',
      language: 'telugu',
      rating: 4.7,
      tags: ['mindfulness', 'telugu', 'concentration']
    },
    {
      id: 18,
      title: 'స్ట్రెస్ రిలీఫ్ మరియు రిలాక్సేషన్ టెక్నిక్స్',
      description: 'తక్షణ ఒత్తిడి ఉపశమనం కోసం సులభమైన పద్ధతులు - గైడెడ్ రిలాక్సేషన్ మరియు బాడీ స్కాన్ మెడిటేషన్.',
      category: 'videos',
      type: 'Video Tutorial',
      duration: '12 minutes',
      language: 'telugu',
      rating: 4.8,
      tags: ['stress relief', 'telugu', 'relaxation']
    },
    {
      id: 19,
      title: 'శాంత సంగీతం మరియు ప్రకృతి ధ్వనులు',
      description: 'మానసిక శాంతి, ధ్యానం మరియు అధ్యయనం కోసం శాంతియుత తెలుగు భక్తి సంగీతం మరియు ప్రకృతి ధ్వనుల సమాహారం.',
      category: 'audio',
      type: 'Music & Sounds',
      duration: '45 minutes',
      language: 'telugu',
      rating: 4.6,
      tags: ['peaceful music', 'telugu', 'nature sounds']
    },
    {
      id: 20,
      title: 'నిద్రలేమి మరియు మంచి నిద్ర కోసం కథలు',
      description: 'నిద్రలేమిని పోగొట్టే శాంతియుత తెలుగు కథలు, లోరీలు మరియు నిద్రకు సహాయపడే గైడెడ్ మెడిటేషన్.',
      category: 'audio',
      type: 'Sleep Aid',
      duration: '30 minutes',
      language: 'telugu',
      rating: 4.5,
      tags: ['sleep stories', 'telugu', 'insomnia help']
    },
    {
      id: 21,
      title: 'ప్రోగ్రెసివ్ మస్కిల్ రిలాక్సేషన్ - తెలుగు గైడ్',
      description: 'కండరాల ఒత్తిడిని తగ్గించడానికి దశలవారీ గైడెడ్ ఆడియో సెషన్ - పూర్తిగా తెలుగు భాషలో వివరణలతో.',
      category: 'audio',
      type: 'Audio Guide',
      duration: '25 minutes',
      language: 'telugu',
      rating: 4.8,
      tags: ['muscle relaxation', 'telugu', 'guided audio']
    },
    {
      id: 22,
      title: 'దైనిక మూడ్ ట్రాకర్ - తెలుగు వర్క్‌షీట్',
      description: 'రోజువారీ మానసిక స్థితి, భావోద్వేగాలు మరియు ట్రిగర్లను రికార్డ్ చేయడానికి తెలుగు భాషలో వర్క్‌షీట్.',
      category: 'tools',
      type: 'Worksheet',
      duration: 'Self-paced',
      language: 'telugu',
      rating: 4.4,
      tags: ['mood tracking', 'telugu', 'daily log']
    },
    {
      id: 23,
      title: 'స్ట్రెస్ మేనేజ్మెంట్ చెక్‌లిస్ట్',
      description: 'విద్యా మరియు వ్యక్తిగత ఒత్తిడిని నిర్వహించడానికి దైనిక మరియు వారపు చెక్‌లిస్ట్ - తెలుగు గైడ్‌లైన్స్‌తో.',
      category: 'tools',
      type: 'Checklist',
      duration: 'Self-paced',
      language: 'telugu',
      rating: 4.7,
      tags: ['stress management', 'telugu', 'planning']
    },
    {
      id: 24,
      title: 'మానసిక ఆరోగ్య డైరీ టెంప్లేట్',
      description: 'దైనిక ఆలోచనలు, భావోద్వేగాలు మరియు అనుభవాలను రికార్డ్ చేయడానికి డిజిటల్ డైరీ టెంప్లేట్ - తెలుగు భాషలో.',
      category: 'tools',
      type: 'Digital Template',
      duration: 'Self-paced',
      language: 'telugu',
      rating: 4.5,
      tags: ['mental health diary', 'telugu', 'emotional tracking']
    },
    {
      id: 25,
      title: 'స్వయం సహాయ మరియు కోపింగ్ స్ట్రాటజీస్',
      description: 'కష్ట సమయాలలో స్వయంగా సహాయం చేసుకోవడానికి వ్యూహాలు, కోపింగ్ మెకానిజమ్స్ మరియు పాజిటివ్ థింకింగ్ టెక్నిక్స్.',
      category: 'tools',
      type: 'Self-Help Guide',
      duration: 'Self-paced',
      language: 'telugu',
      rating: 4.6,
      tags: ['self-help', 'telugu', 'coping strategies']
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesLanguage = selectedLanguage === 'all' || resource.language === selectedLanguage;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesLanguage && matchesSearch;
  });

  const ResourceCard = ({ resource }) => (
    <div className="card hover:shadow-lg transition-shadow duration-200 group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {resource.category === 'videos' && <Video className="h-5 w-5 text-red-500" />}
          {resource.category === 'audio' && <Headphones className="h-5 w-5 text-green-500" />}
          {resource.category === 'articles' && <FileText className="h-5 w-5 text-blue-500" />}
          {resource.category === 'tools' && <Brain className="h-5 w-5 text-purple-500" />}
          <span className="text-sm font-medium text-secondary-600">{resource.type}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-secondary-600">{resource.rating}</span>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
        {resource.title}
      </h3>
      
      <p className="text-secondary-600 mb-3 line-clamp-2">{resource.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1 text-sm text-secondary-500">
          <Clock className="h-4 w-4" />
          <span>{resource.duration}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-secondary-500">
          <Globe className="h-4 w-4" />
          <span className="capitalize">{resource.language}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {resource.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium">
          {resource.category === 'videos' ? <Play className="h-4 w-4" /> : 
           resource.category === 'audio' ? <Headphones className="h-4 w-4" /> : 
           <ExternalLink className="h-4 w-4" />}
          <span>Access Resource</span>
        </button>
        <button className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-full transition-colors">
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const EmergencyCard = ({ contact }) => (
    <div className="card border-l-4 border-red-500 bg-red-50">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-red-100 rounded-full">
          <Phone className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-secondary-900 mb-1">{contact.name}</h3>
          <p className="text-lg font-mono text-red-700 mb-1">{contact.number}</p>
          <p className="text-sm text-secondary-600">{contact.description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="h-8 w-8 text-secondary-600" />
        <h1 className="text-3xl font-bold text-secondary-900">Wellness Resources</h1>
      </div>

      {/* Emergency Support Banner */}
      <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-800">Emergency Support - Available 24/7</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyContacts.map((contact, index) => (
            <EmergencyCard key={index} contact={contact} />
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-secondary-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="english">All Languages</option>
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  {category.id === 'all' ? resources.length : resources.filter(r => r.category === category.id).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {/* No results message */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-600 mb-2">No resources found</h3>
          <p className="text-secondary-500">Try adjusting your search criteria or browse all categories.</p>
        </div>
      )}

      {/* Additional Help Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-800">Need Additional Support?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-secondary-900 mb-1">Book Appointment</h3>
            <p className="text-sm text-secondary-600 mb-3">Schedule with our counselors</p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">Book Now</button>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-secondary-900 mb-1">AI Chat Support</h3>
            <p className="text-sm text-secondary-600 mb-3">24/7 intelligent support</p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">Start Chat</button>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-semibold text-secondary-900 mb-1">Peer Support</h3>
            <p className="text-sm text-secondary-600 mb-3">Connect with fellow students</p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">Join Community</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
