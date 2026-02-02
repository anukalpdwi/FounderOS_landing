import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, Check, X, Clock, 
  Sparkles, MessageSquare, Zap, RefreshCw,
  Instagram, Facebook, Youtube, Linkedin, Twitter,
  ChevronRight, Play, Edit3, Calendar, Rocket
} from 'lucide-react';

interface MarketingAgentProps {
  isDark: boolean;
  onBack: () => void;
}

interface PendingPost {
  id: string;
  content: string;
  platform: string;
  hashtags: string[];
  authenticity_score: number;
  created_at: string;
  status: string;
  scheduled_time?: string;
}

interface OnboardingAnswer {
  question_id: string;
  answer: string | string[];
}

const PLATFORMS = {
  discord: { icon: MessageSquare, color: '#5865F2', name: 'Discord' },
  x: { icon: Twitter, color: '#1D9BF0', name: 'X' },
  instagram: { icon: Instagram, color: '#E4405F', name: 'Instagram' },
  facebook: { icon: Facebook, color: '#1877F2', name: 'Facebook' },
  linkedin: { icon: Linkedin, color: '#0A66C2', name: 'LinkedIn' },
  youtube: { icon: Youtube, color: '#FF0000', name: 'YouTube' },
};

const ONBOARDING_QUESTIONS = [
  {
    id: 'brand_voice',
    question: 'How would you describe your brand voice?',
    options: ['Casual & Friendly', 'Professional & Authoritative', 'Witty & Playful', 'Inspirational & Motivating', 'Direct & No-nonsense']
  },
  {
    id: 'target_audience',
    question: 'Who is your primary audience?',
    options: ['Startup Founders', 'Tech Professionals', 'General Consumers', 'Enterprise Decision Makers', 'Investors & VCs']
  },
  {
    id: 'emoji_style',
    question: 'How do you feel about emojis?',
    options: ['Never use them', 'Rarely, maybe 1-2', 'A few to add personality', 'Love them! 🚀🔥💡']
  }
];

const MarketingAgentDetail: React.FC<MarketingAgentProps> = ({ isDark, onBack }) => {
  const [view, setView] = useState<'main' | 'onboarding' | 'generate'>('main');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswer[]>([]);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [approvedPosts, setApprovedPosts] = useState<PendingPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  const [generationInput, setGenerationInput] = useState({
    topic: '',
    platform: 'discord',
    mood: ''
  });
  
  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulePost$, setSchedulePost$] = useState<PendingPost | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const colors = {
    surface: isDark ? 'bg-[#0E0E12]/80' : 'bg-white/90',
    border: isDark ? 'border-white/[0.08]' : 'border-black/[0.06]',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSec: isDark ? 'text-white/60' : 'text-gray-500',
  };

  // Check onboarding status
  useEffect(() => {
    const stored = localStorage.getItem('founderos_onboarded');
    if (stored) setIsOnboarded(true);
  }, []);

  // Fetch posts
  useEffect(() => {
    fetchPendingPosts();
    fetchApprovedPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/marketing/pending/user_123');
      if (res.ok) {
        const data = await res.json();
        setPendingPosts(data.posts || []);
      }
    } catch (e) {
      console.warn('Backend not available');
    }
  };

  const fetchApprovedPosts = async () => {
    try {
      // Get all posts and filter for approved ones on frontend (simplified)
      const res = await fetch('http://localhost:8000/api/v1/marketing/pending/user_123');
      if (res.ok) {
        const data = await res.json();
        // Filter approved posts (this should be a separate endpoint in production)
        setApprovedPosts((data.posts || []).filter((p: PendingPost) => p.status === 'approved'));
      }
    } catch (e) {}
  };

  const handleOnboardingAnswer = (answer: string) => {
    const question = ONBOARDING_QUESTIONS[onboardingStep];
    setAnswers([...answers, { question_id: question.id, answer }]);
    
    if (onboardingStep < ONBOARDING_QUESTIONS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await fetch('http://localhost:8000/api/v1/marketing/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'user_123', answers })
      });
    } catch (e) {}
    
    localStorage.setItem('founderos_onboarded', 'true');
    setIsOnboarded(true);
    setView('main');
  };

  const generateContent = async () => {
    setIsGenerating(true);
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_123',
          topic: generationInput.topic,
          platform: generationInput.platform,
          mood: generationInput.mood || undefined
        })
      });
      
      if (res.ok) {
        await fetchPendingPosts();
        setGenerationInput({ topic: '', platform: 'x', mood: '' });
        setView('main');
      }
    } catch (e) {
      console.error('Generation failed');
    }
    
    setIsGenerating(false);
  };

  const approvePost = async (postId: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/marketing/pending/${postId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      fetchPendingPosts();
    } catch (e) {}
  };

  const rejectPost = async (postId: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/marketing/pending/${postId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      fetchPendingPosts();
    } catch (e) {}
  };

  // Post content directly via API
const queueForAutoPost = async (post: PendingPost) => {
  setIsPosting(post.id);
  
  try {
    // First approve the post
    await fetch(`http://localhost:8000/api/v1/marketing/pending/${post.id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' })
    });
    
    // Then publish directly via API
    const res = await fetch('http://localhost:8000/api/v1/marketing/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id, platform: post.platform })
    });
    
    if (res.ok) {
      const data = await res.json();
      
      if (data.success) {
        setPostSuccess(`✅ ${data.message}`);
      } else {
        // Show specific error message from API
        setPostSuccess(`⚠️ ${data.message}`);
      }
      
      setTimeout(() => setPostSuccess(null), 8000);
      fetchPendingPosts();
    } else {
      setPostSuccess('❌ Failed to publish. Check your connection.');
      setTimeout(() => setPostSuccess(null), 3000);
    }
  } catch (e) {
    setPostSuccess('❌ Failed to post. Is the backend running?');
    setTimeout(() => setPostSuccess(null), 3000);
  }
  
  setIsPosting(null);
};

  // Schedule post for later
const schedulePost = async (post: PendingPost, scheduledTime: Date) => {
  setIsPosting(post.id);
  
  try {
    // First approve the post
    await fetch(`http://localhost:8000/api/v1/marketing/pending/${post.id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' })
    });
    
    // Schedule via the scheduler API (NOT publish!)
    const res = await fetch('http://localhost:8000/api/v1/accounts/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: 'user_123',
        content: post.content,
        platforms: [post.platform],
        scheduled_time: scheduledTime.toISOString(),
        image_url: null
      })
    });
    
    if (res.ok) {
      setPostSuccess(`⏰ Scheduled for ${scheduledTime.toLocaleString()}`);
    } else {
      setPostSuccess('❌ Failed to schedule');
    }
    setTimeout(() => setPostSuccess(null), 5000);
    fetchPendingPosts();
  } catch (e) {
    setPostSuccess('❌ Failed to schedule');
    setTimeout(() => setPostSuccess(null), 3000);
  }
  
  setIsPosting(null);
};

  // Render Onboarding
  if (view === 'onboarding') {
    const question = ONBOARDING_QUESTIONS[onboardingStep];
    
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold mb-2">Let's Learn Your Style</h2>
            <p className={`${colors.textSec}`}>Question {onboardingStep + 1} of {ONBOARDING_QUESTIONS.length}</p>
          </div>
          
          <div className={`rounded-2xl p-6 ${colors.surface} ${colors.border} border`}>
            <h3 className="text-lg font-semibold mb-6">{question.question}</h3>
            
            <div className="space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOnboardingAnswer(option)}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2 justify-center mt-6">
            {ONBOARDING_QUESTIONS.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-8 rounded-full transition-colors ${i <= onboardingStep ? 'bg-emerald-500' : isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Generate View
  if (view === 'generate') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={() => setView('main')} className={`flex items-center gap-2 mb-6 ${colors.textSec} hover:text-white transition-colors`}>
          <ArrowLeft size={20} /> Back
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Generate Content</h2>
        
        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium mb-2">What do you want to post about?</label>
            <textarea
              value={generationInput.topic}
              onChange={(e) => setGenerationInput({ ...generationInput, topic: e.target.value })}
              placeholder="e.g., Just launched our MVP and got 100 signups in the first hour!"
              className={`w-full p-4 rounded-xl resize-none h-32 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border focus:border-emerald-500 focus:outline-none transition-colors`}
            />
          </div>
          
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Platform</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(PLATFORMS).map(([key, { icon: Icon, color, name }]) => (
                <button
                  key={key}
                  onClick={() => setGenerationInput({ ...generationInput, platform: key })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${generationInput.platform === key ? 'ring-2 ring-emerald-500 scale-105' : ''} ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
                  style={generationInput.platform === key ? { backgroundColor: color + '20' } : {}}
                >
                  <Icon size={18} style={{ color }} />
                  {name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-2">Mood (optional)</label>
            <input
              value={generationInput.mood}
              onChange={(e) => setGenerationInput({ ...generationInput, mood: e.target.value })}
              placeholder="e.g., excited, thoughtful, celebratory"
              className={`w-full p-4 rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border focus:border-emerald-500 focus:outline-none transition-colors`}
            />
          </div>
          
          {/* Generate Button */}
          <button
            onClick={generateContent}
            disabled={!generationInput.topic || isGenerating}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Content
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Main View
  return (
    <div className="p-6">
      {/* Success Notification */}
      <AnimatePresence mode='wait'>
        {postSuccess && (
          <motion.div
            key="success-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium flex items-center gap-3"
          >
            <Rocket size={20} />
            {postSuccess}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-xl ${colors.textSec} hover:text-white hover:bg-white/10 transition-all`}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Marketing Director</h1>
            <p className={colors.textSec}>Growth & Social Media</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {!isOnboarded && (
            <button
              onClick={() => setView('onboarding')}
              className="px-4 py-2 rounded-xl font-medium bg-amber-500/20 text-amber-500 border border-amber-500/30"
            >
              Complete Setup
            </button>
          )}
          <button
            onClick={() => setView('generate')}
            className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center gap-2"
          >
            <Sparkles size={18} />
            Generate Post
          </button>
        </div>
      </div>
      
      {/* Pending Posts */}
      <div className={`rounded-2xl p-6 ${colors.surface} ${colors.border} border mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Pending Approval
          </h2>
          <button onClick={fetchPendingPosts} className={`p-2 rounded-lg ${colors.textSec} hover:bg-white/10`}>
            <RefreshCw size={18} />
          </button>
        </div>
        
        {pendingPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✨</div>
            <p className={colors.textSec}>No pending posts. Generate some content!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPosts.map((post) => {
              const platform = PLATFORMS[post.platform as keyof typeof PLATFORMS] || PLATFORMS.x;
              const PlatformIcon = platform.icon;
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} border ${colors.border}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PlatformIcon size={18} style={{ color: platform.color }} />
                      <span className="font-medium">{platform.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${post.authenticity_score > 0.7 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                        {Math.round(post.authenticity_score * 100)}% authentic
                      </span>
                    </div>
                    
                    <button
                      onClick={() => rejectPost(post.id)}
                      className="p-2 rounded-lg bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <p className={`text-sm ${colors.textSec} leading-relaxed mb-4`}>
                    {post.content}
                  </p>
                  
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-blue-400">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => queueForAutoPost(post)}
                      disabled={isPosting === post.id}
                      className="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isPosting === post.id ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : (
                        <Rocket size={16} />
                      )}
                      {isPosting === post.id ? 'Queueing...' : 'Post Now'}
                    </button>
                    <button
                      onClick={() => {
                        setSchedulePost$(post);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setScheduleDate(tomorrow.toISOString().split('T')[0]);
                        setShowScheduleModal(true);
                      }}
                      disabled={isPosting === post.id}
                      className="px-4 py-2.5 rounded-xl font-medium border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center gap-2"
                    >
                      <Calendar size={16} />
                      Schedule
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-2xl p-5 ${colors.surface} ${colors.border} border text-center`}>
          <div className="text-3xl font-bold text-emerald-500">1,420</div>
          <div className={`text-sm ${colors.textSec}`}>Posts Generated</div>
        </div>
        <div className={`rounded-2xl p-5 ${colors.surface} ${colors.border} border text-center`}>
          <div className="text-3xl font-bold text-blue-500">98%</div>
          <div className={`text-sm ${colors.textSec}`}>Approval Rate</div>
        </div>
        <div className={`rounded-2xl p-5 ${colors.surface} ${colors.border} border text-center`}>
          <div className="text-3xl font-bold text-amber-500">$12</div>
          <div className={`text-sm ${colors.textSec}`}>Saved Today</div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && schedulePost$ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl ${colors.surface} border ${colors.border} p-6`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Schedule Post</h3>
                  <p className={`text-sm ${colors.textSec}`}>Choose when to publish</p>
                </div>
              </div>

              {/* Post Preview */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} mb-6`}>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const platform = PLATFORMS[schedulePost$.platform as keyof typeof PLATFORMS] || PLATFORMS.discord;
                    const PlatformIcon = platform.icon;
                    return <PlatformIcon size={16} style={{ color: platform.color }} />;
                  })()}
                  <span className="font-medium text-sm">{PLATFORMS[schedulePost$.platform as keyof typeof PLATFORMS]?.name || 'Discord'}</span>
                </div>
                <p className={`text-sm ${colors.textSec} line-clamp-3`}>{schedulePost$.content.substring(0, 120)}...</p>
              </div>

              {/* Date & Time Picker */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textSec}`}>Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} border ${colors.border} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${colors.text}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textSec}`}>Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} border ${colors.border} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${colors.text}`}
                  />
                </div>
              </div>

              {/* Quick Select */}
              <div className="flex gap-2 mb-6">
                {[
                  { label: 'Tomorrow 9 AM', days: 1, hour: 9 },
                  { label: 'Tomorrow 6 PM', days: 1, hour: 18 },
                  { label: 'In 3 days', days: 3, hour: 10 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + preset.days);
                      d.setHours(preset.hour, 0, 0, 0);
                      setScheduleDate(d.toISOString().split('T')[0]);
                      setScheduleTime(`${preset.hour.toString().padStart(2, '0')}:00`);
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (schedulePost$ && scheduleDate && scheduleTime) {
                      const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
                      await schedulePost(schedulePost$, scheduledTime);
                      setShowScheduleModal(false);
                      setSchedulePost$(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketingAgentDetail;
