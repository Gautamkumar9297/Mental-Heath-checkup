import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share, 
  ThumbsUp, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Trophy, 
  Bookmark,
  Flag,
  MoreVertical,
  Send,
  Smile,
  Camera,
  Paperclip,
  Video
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const PeerSupport = () => {
  const [activeTab, setActiveTab] = useState('community');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for community posts
  const mockPosts = [
    {
      id: 1,
      author: {
        name: 'Sarah M.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        isVerified: true,
        role: 'Peer Supporter'
      },
      content: 'Just wanted to share that taking small breaks during study sessions has really helped my anxiety. Sometimes 5 minutes of deep breathing makes all the difference. What techniques work for you?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      category: 'anxiety',
      likes: 24,
      comments: 8,
      isLiked: false,
      isBookmarked: true,
      tags: ['anxiety', 'study-tips', 'breathing']
    },
    {
      id: 2,
      author: {
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        isVerified: false,
        role: 'Student'
      },
      content: 'Feeling overwhelmed with final exams approaching. Anyone else dealing with similar stress? Looking for study buddies or just someone to talk to.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      category: 'stress',
      likes: 15,
      comments: 12,
      isLiked: true,
      isBookmarked: false,
      tags: ['exams', 'stress', 'study-group']
    },
    {
      id: 3,
      author: {
        name: 'Maya K.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        isVerified: true,
        role: 'Mental Health Advocate'
      },
      content: 'Reminder: Your mental health journey is unique to you. What works for others might not work for you, and that\'s perfectly okay. Be patient and kind with yourself. 💙',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      category: 'motivation',
      likes: 45,
      comments: 6,
      isLiked: false,
      isBookmarked: false,
      tags: ['motivation', 'self-care', 'mental-health']
    }
  ];

  // Mock data for support groups
  const mockGroups = [
    {
      id: 1,
      name: 'Anxiety Support Circle',
      description: 'A safe space to discuss anxiety management strategies and support each other',
      members: 156,
      category: 'anxiety',
      isPrivate: false,
      moderators: ['Dr. Smith', 'Lisa P.'],
      nextMeeting: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=300&h=200&fit=crop',
      recentActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Depression Warriors',
      description: 'Together we fight depression with understanding, support, and shared experiences',
      members: 89,
      category: 'depression',
      isPrivate: true,
      moderators: ['Maya R.', 'Sam T.'],
      nextMeeting: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=300&h=200&fit=crop',
      recentActivity: '1 hour ago'
    },
    {
      id: 3,
      name: 'Mindfulness & Meditation',
      description: 'Explore mindfulness practices and meditation techniques for better mental health',
      members: 234,
      category: 'wellness',
      isPrivate: false,
      moderators: ['Zen Master', 'Alice M.'],
      nextMeeting: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68e71?w=300&h=200&fit=crop',
      recentActivity: '30 minutes ago'
    },
    {
      id: 4,
      name: 'Academic Stress Management',
      description: 'Students supporting students through academic challenges and stress',
      members: 178,
      category: 'stress',
      isPrivate: false,
      moderators: ['Prof. Johnson', 'Student Council'],
      nextMeeting: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop',
      recentActivity: '1 day ago'
    }
  ];

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      setGroups(mockGroups);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle post interactions
  const toggleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const toggleBookmark = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isBookmarked: !post.isBookmarked };
      }
      return post;
    }));
  };

  // Create new post
  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost = {
      id: posts.length + 1,
      author: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        isVerified: false,
        role: 'Student'
      },
      content: newPostContent,
      timestamp: new Date(),
      category: 'general',
      likes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
      tags: []
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowNewPostForm(false);
  };

  // Render post component
  const renderPost = (post) => (
    <div key={post.id} className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6 mb-6 hover:shadow-xl transition-shadow">
      {/* Post Header */}
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-secondary-900">{post.author.name}</h3>
            {post.author.isVerified && (
              <CheckCircle className="h-4 w-4 text-primary-500" />
            )}
            <span className="text-xs text-secondary-500">• {post.author.role}</span>
          </div>
          <p className="text-sm text-secondary-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
          </p>
        </div>
        <button className="p-2 hover:bg-secondary-100 rounded-full transition-colors">
          <MoreVertical className="h-4 w-4 text-secondary-500" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-secondary-700 leading-relaxed">{post.content}</p>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-primary-50 ${
              post.isLiked ? 'text-primary-600' : 'text-secondary-600'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{post.likes}</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-primary-50 text-secondary-600">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-primary-50 text-secondary-600">
            <Share className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
        
        <button
          onClick={() => toggleBookmark(post.id)}
          className={`p-2 rounded-lg transition-all hover:bg-primary-50 ${
            post.isBookmarked ? 'text-primary-600' : 'text-secondary-600'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );

  // Render support group card
  const renderGroupCard = (group) => (
    <div key={group.id} className="bg-white rounded-xl shadow-lg border border-secondary-100 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-32 overflow-hidden">
        <img
          src={group.image}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3">
          {group.isPrivate ? (
            <span className="bg-warning-500 text-white px-2 py-1 text-xs rounded-full">
              <Shield className="h-3 w-3 inline mr-1" />
              Private
            </span>
          ) : (
            <span className="bg-success-500 text-white px-2 py-1 text-xs rounded-full">
              <Eye className="h-3 w-3 inline mr-1" />
              Public
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-semibold text-lg">{group.name}</h3>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-secondary-600 text-sm mb-4 leading-relaxed">
          {group.description}
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-500">Members</span>
            <span className="font-medium text-secondary-700">{group.members}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-500">Next Meeting</span>
            <span className="font-medium text-secondary-700">
              {format(group.nextMeeting, 'MMM dd')}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-500">Last Activity</span>
            <span className="font-medium text-secondary-700">{group.recentActivity}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xs text-secondary-500">Moderators:</span>
          <div className="flex items-center space-x-1">
            {group.moderators.slice(0, 2).map((mod, index) => (
              <span key={index} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                {mod}
              </span>
            ))}
          </div>
        </div>
        
        <button
          onClick={() => setSelectedGroup(group)}
          className="w-full btn-primary text-sm py-2"
        >
          {group.isPrivate ? 'Request to Join' : 'Join Group'}
        </button>
      </div>
    </div>
  );

  // Tab navigation
  const tabs = [
    { id: 'community', label: 'Community Feed', icon: MessageCircle },
    { id: 'groups', label: 'Support Groups', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'resources', label: 'Peer Resources', icon: Heart }
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-1/3"></div>
          <div className="h-32 bg-secondary-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-secondary-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-secondary-900">Peer Support Community</h1>
          </div>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Connect with fellow students, share experiences, and support each other through your mental health journey
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-secondary-100 p-1 rounded-lg flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Community Feed Tab */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search posts, topics, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Filter className="h-4 w-4 text-secondary-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-secondary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="stress">Stress</option>
                  <option value="motivation">Motivation</option>
                  <option value="general">General</option>
                </select>
                <button
                  onClick={() => setShowNewPostForm(true)}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Post</span>
                </button>
              </div>
            </div>

            {/* New Post Form */}
            {showNewPostForm && (
              <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6 mb-6">
                <div className="flex items-start space-x-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                    alt="You"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your thoughts, experiences, or ask for support..."
                      className="w-full p-3 border border-secondary-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
                      rows={4}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button className="p-2 hover:bg-secondary-100 rounded-full transition-colors">
                          <Camera className="h-4 w-4 text-secondary-500" />
                        </button>
                        <button className="p-2 hover:bg-secondary-100 rounded-full transition-colors">
                          <Paperclip className="h-4 w-4 text-secondary-500" />
                        </button>
                        <button className="p-2 hover:bg-secondary-100 rounded-full transition-colors">
                          <Smile className="h-4 w-4 text-secondary-500" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setShowNewPostForm(false)}
                          className="px-4 py-2 text-secondary-600 hover:text-secondary-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreatePost}
                          disabled={!newPostContent.trim()}
                          className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                          <span>Post</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(renderPost)
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-700 mb-2">No posts found</h3>
                  <p className="text-secondary-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Groups Tab */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Support Groups</h2>
              <p className="text-secondary-600">Join moderated groups focused on specific mental health topics</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(renderGroupCard)}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Upcoming Events</h2>
              <p className="text-secondary-600">Join virtual and in-person mental health events</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sample events */}
              <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">Mindfulness Workshop</h3>
                    <p className="text-secondary-600 text-sm mb-4">Learn practical mindfulness techniques for stress reduction</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-secondary-500">
                        <Clock className="h-4 w-4 mr-2" />
                        Tomorrow, 2:00 PM - 3:30 PM
                      </div>
                      <div className="flex items-center text-secondary-500">
                        <Video className="h-4 w-4 mr-2" />
                        Virtual Event
                      </div>
                    </div>
                    <button className="btn-primary text-sm mt-4 w-full">Register</button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-success-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">Peer Support Meetup</h3>
                    <p className="text-secondary-600 text-sm mb-4">In-person gathering for students supporting each other</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-secondary-500">
                        <Clock className="h-4 w-4 mr-2" />
                        Friday, 6:00 PM - 8:00 PM
                      </div>
                      <div className="flex items-center text-secondary-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        Student Center, Room 203
                      </div>
                    </div>
                    <button className="btn-primary text-sm mt-4 w-full">RSVP</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Peer Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Peer Resources</h2>
              <p className="text-secondary-600">Resources created by and for students</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample resources */}
              <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-mint-100 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-mint-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">Coping Strategies Guide</h3>
                    <p className="text-secondary-600 text-sm mb-4">Student-created guide with practical coping mechanisms</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500">By Sarah M.</span>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Download</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-lavender-100 p-3 rounded-lg">
                    <Heart className="h-6 w-6 text-lavender-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">Self-Care Checklist</h3>
                    <p className="text-secondary-600 text-sm mb-4">Daily self-care activities for better mental health</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500">By Alex C.</span>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-warning-100 p-3 rounded-lg">
                    <Trophy className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">Success Stories</h3>
                    <p className="text-secondary-600 text-sm mb-4">Inspiring recovery journeys shared by peers</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500">Community</span>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Read</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Community Guidelines */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Community Guidelines</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Be respectful and supportive of all community members</p>
                <p>• Share experiences, not medical advice</p>
                <p>• Maintain confidentiality and respect privacy</p>
                <p>• Report inappropriate content to moderators</p>
                <p>• Seek immediate help for crisis situations - don't rely solely on peer support</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Crisis Resources */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Crisis Resources</h3>
              <div className="text-sm text-red-700 space-y-2">
                <p><strong>National Suicide Prevention Lifeline:</strong> <a href="tel:988" className="underline">988</a></p>
                <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                <p><strong>Campus Emergency:</strong> <a href="tel:555-123-4567" className="underline">(555) 123-4567</a></p>
                <p className="italic">If you're in immediate danger, call 911 or go to your nearest emergency room.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerSupport;
