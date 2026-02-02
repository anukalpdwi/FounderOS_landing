import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MessageCircle, Twitter, Instagram, Facebook, 
  Linkedin, Youtube, Clock, CheckCircle2, XCircle, Trash2,
  Edit3, Calendar, RefreshCw, MoreVertical, Send
} from 'lucide-react';

const PLATFORMS = [
  { id: 'discord', name: 'Discord', icon: MessageCircle, color: '#5865F2', gradient: 'from-[#5865F2] to-[#7289DA]' },
  { id: 'x', name: 'X', icon: Twitter, color: '#1D9BF0', gradient: 'from-[#1D9BF0] to-[#0A7CC9]' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', gradient: 'from-[#F56040] to-[#833AB4]' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', gradient: 'from-[#1877F2] to-[#4267B2]' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', gradient: 'from-[#0A66C2] to-[#004182]' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', gradient: 'from-[#FF0000] to-[#CC0000]' },
];

interface Post {
  id: string;
  content: string;
  platform: string;
  status: 'pending' | 'approved' | 'posted' | 'scheduled' | 'failed';
  scheduled_time?: string;
  created_at: string;
  published_at?: string;
}

interface PlatformManagerProps {
  isDark: boolean;
  onBack: () => void;
}

const API_BASE = 'http://localhost:8000/api/v1';

const PlatformManager: React.FC<PlatformManagerProps> = ({ isDark, onBack }) => {
  const [activePlatform, setActivePlatform] = useState('discord');
  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');

  const colors = {
    bg: isDark ? 'bg-[#0A0A0F]' : 'bg-white',
    surface: isDark ? 'bg-white/[0.03]' : 'bg-gray-50',
    surfaceHover: isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100',
    border: isDark ? 'border-white/10' : 'border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-white/50' : 'text-gray-500',
  };

  useEffect(() => {
    fetchAllPosts();
    fetchScheduledPosts();
  }, [activePlatform]);

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      // Fetch all posts for user and filter by platform
      const res = await fetch(`${API_BASE}/marketing/pending/user_123`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.posts || []).filter((p: Post) => 
          p.platform === activePlatform && (p.status === 'posted' || p.status === 'approved')
        );
        setPosts(filtered.sort((a: Post, b: Post) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (e) {
      console.error('Failed to fetch posts');
    }
    setLoading(false);
  };

  const fetchScheduledPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/accounts/scheduled?user_id=user_123&status=pending`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.posts || []).filter((p: any) => {
          const platforms = JSON.parse(p.platforms || '[]');
          return platforms.includes(activePlatform);
        });
        setScheduledPosts(filtered.sort((a: any, b: any) => 
          new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
        ));
      }
    } catch (e) {
      console.error('Failed to fetch scheduled posts');
    }
  };

  const deletePost = async (postId: string, isScheduled: boolean) => {
    try {
      if (isScheduled) {
        await fetch(`${API_BASE}/accounts/scheduled/${postId}?user_id=user_123`, { method: 'DELETE' });
        setScheduledPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        // For regular posts, we'd need a delete endpoint
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (e) {
      console.error('Failed to delete');
    }
  };

  const saveEdit = async () => {
    if (!editingPost) return;
    // In production, this would call an API to update the post
    setPosts(prev => prev.map(p => 
      p.id === editingPost.id ? { ...p, content: editContent } : p
    ));
    setEditingPost(null);
    setEditContent('');
  };

  const currentPlatform = PLATFORMS.find(p => p.id === activePlatform) || PLATFORMS[0];
  const PlatformIcon = currentPlatform.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      posted: 'bg-emerald-500/20 text-emerald-400',
      scheduled: 'bg-amber-500/20 text-amber-400',
      pending: 'bg-blue-500/20 text-blue-400',
      failed: 'bg-red-500/20 text-red-400',
      approved: 'bg-cyan-500/20 text-cyan-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-xl ${colors.textMuted} hover:text-white hover:bg-white/10 transition-all`}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Platform Manager</h1>
            <p className={colors.textMuted}>Manage your posts across platforms</p>
          </div>
        </div>
        <button 
          onClick={() => { fetchAllPosts(); fetchScheduledPosts(); }}
          className={`p-2 rounded-xl ${colors.textMuted} hover:text-emerald-500 transition-colors`}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isActive = activePlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                isActive 
                  ? `bg-gradient-to-r ${platform.gradient} text-white shadow-lg` 
                  : `${colors.surface} ${colors.surfaceHover} border ${colors.border}`
              }`}
            >
              <Icon size={18} />
              {platform.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Posts */}
        <div className={`rounded-2xl p-6 ${colors.surface} border ${colors.border}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center`}>
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Upcoming</h2>
              <p className={`text-sm ${colors.textMuted}`}>{scheduledPosts.length} posts scheduled</p>
            </div>
          </div>

          {scheduledPosts.length === 0 ? (
            <div className={`text-center py-12 ${colors.textMuted}`}>
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No scheduled posts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${colors.border}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-amber-500" />
                      <span className="text-sm font-medium text-amber-500">
                        {formatDate(post.scheduled_time || '')}
                      </span>
                    </div>
                    <button
                      onClick={() => deletePost(post.id, true)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      title="Cancel"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className={`text-sm ${colors.textMuted} line-clamp-2`}>{post.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Previous Posts */}
        <div className={`rounded-2xl p-6 ${colors.surface} border ${colors.border}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentPlatform.gradient} flex items-center justify-center`}>
              <PlatformIcon size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Previous Posts</h2>
              <p className={`text-sm ${colors.textMuted}`}>{posts.length} posts on {currentPlatform.name}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin text-emerald-500" size={24} />
            </div>
          ) : posts.length === 0 ? (
            <div className={`text-center py-12 ${colors.textMuted}`}>
              <Send size={48} className="mx-auto mb-4 opacity-50" />
              <p>No posts yet on {currentPlatform.name}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${colors.border}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(post.status)}`}>
                        {post.status}
                      </span>
                      <span className={`text-xs ${colors.textMuted}`}>
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingPost(post); setEditContent(post.content); }}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deletePost(post.id, false)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${colors.textMuted} line-clamp-3`}>{post.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl ${colors.surface} border ${colors.border} p-6`}
            >
              <h3 className="font-bold text-lg mb-4">Edit Post</h3>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${colors.border} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${colors.text} resize-none`}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setEditingPost(null)}
                  className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-white/5' : 'bg-gray-100'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlatformManager;
