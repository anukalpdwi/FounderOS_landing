import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Loader2, ExternalLink, Link2, 
  MessageCircle, Instagram, Facebook, Youtube, 
  Twitter, Linkedin, AlertCircle, Zap, Calendar,
  Clock, CheckCircle2, XCircle
} from 'lucide-react';

// Platform configuration
const PLATFORMS = [
  {
    id: 'discord',
    name: 'Discord',
    icon: MessageCircle,
    color: '#5865F2',
    gradient: 'from-[#5865F2] to-[#7289DA]',
    method: 'webhook',
    description: 'Post to any channel via webhooks',
    free: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    gradient: 'from-[#F56040] via-[#E4405F] to-[#833AB4]',
    method: 'oauth',
    description: 'Requires Business account',
    free: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    gradient: 'from-[#1877F2] to-[#4267B2]',
    method: 'oauth',
    description: 'Post to Pages you manage',
    free: true,
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    icon: Twitter,
    color: '#000000',
    gradient: 'from-[#14171A] to-[#657786]',
    method: 'extension',
    description: 'Use FounderOS Chrome Extension',
    free: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    gradient: 'from-[#0A66C2] to-[#004182]',
    method: 'extension',
    description: 'Use FounderOS Chrome Extension',
    free: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    gradient: 'from-[#FF0000] to-[#CC0000]',
    method: 'oauth',
    description: 'Video uploads only',
    free: true,
  },
];

interface ConnectAccountsProps {
  userId: string;
  theme: 'dark' | 'light';
  onClose?: () => void;
}

interface ConnectedAccount {
  platform: string;
  account_name: string;
  connected: boolean;
}

const API_BASE = 'http://localhost:8000/api/v1';

const ConnectAccounts: React.FC<ConnectAccountsProps> = ({ userId, theme, onClose }) => {
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [showInstagramSetup, setShowInstagramSetup] = useState(false);
  const [instagramInstructions, setInstagramInstructions] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [serverName, setServerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Fetch connected accounts on mount
  useEffect(() => {
    fetchConnectedAccounts();
  }, [userId]);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE}/accounts/platforms?user_id=${userId}`);
      const data = await response.json();
      
      const connected: Record<string, string> = {};
      data.platforms?.forEach((p: any) => {
        if (p.connected) {
          connected[p.id] = p.account_name || 'Connected';
        }
      });
      setConnectedAccounts(connected);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId: string, method: string) => {
    setError(null);
    setSuccess(null);

    if (method === 'webhook') {
      setShowDiscordModal(true);
      return;
    }

    if (method === 'extension') {
      // Open extension instructions
      window.open('/founderos-extension', '_blank');
      return;
    }

    if (method === 'oauth') {
      // Handle Instagram/Facebook OAuth
      if (platformId === 'instagram' || platformId === 'facebook') {
        await handleInstagramConnect();
      } else if (platformId === 'youtube') {
        setError('YouTube OAuth coming soon!');
      }
      return;
    }
  };

  // State for Instagram account selection after OAuth
  const [showInstagramAccountsModal, setShowInstagramAccountsModal] = useState(false);
  const [instagramOAuthData, setInstagramOAuthData] = useState<any>(null);

  // Listen for OAuth callback messages from popup
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      // Handle Instagram OAuth success
      if (event.data?.type === 'instagram_oauth_success') {
        const { instagram_accounts, access_token, expires_at } = event.data;
        
        if (instagram_accounts && instagram_accounts.length > 0) {
          if (instagram_accounts.length === 1) {
            // Only one account, connect it automatically
            await connectInstagramAccount(instagram_accounts[0], access_token, expires_at);
          } else {
            // Multiple accounts, show selection modal
            setInstagramOAuthData({ accounts: instagram_accounts, access_token, expires_at });
            setShowInstagramAccountsModal(true);
          }
        }
        setConnectingPlatform(null);
      }
      
      // Handle Instagram OAuth error
      if (event.data?.type === 'instagram_oauth_error') {
        setError(event.data.error || 'Instagram OAuth failed');
        setConnectingPlatform(null);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [userId]);

  const connectInstagramAccount = async (account: any, access_token: string, expires_at: string) => {
    try {
      const response = await fetch(`${API_BASE}/accounts/instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          instagram_id: account.instagram_id,
          username: account.username,
          page_id: account.page_id,
          access_token: access_token,
          page_access_token: account.page_access_token,
          expires_at: expires_at,
          profile_picture: account.profile_picture
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Instagram @${account.username} connected successfully!`);
        setConnectedAccounts(prev => ({ ...prev, instagram: `@${account.username}` }));
        setShowInstagramAccountsModal(false);
        setInstagramOAuthData(null);
      } else {
        setError(data.detail || 'Failed to connect Instagram');
      }
    } catch (err) {
      setError('Failed to connect Instagram account');
    }
  };

  const handleInstagramConnect = async () => {
    setConnectingPlatform('instagram');
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/accounts/instagram/auth?user_id=${userId}`);
      const data = await response.json();

      if (data.success && data.auth_url) {
        // Open OAuth in popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        window.open(
          data.auth_url,
          'Instagram OAuth',
          `width=${width},height=${height},left=${left},top=${top},popup=yes`
        );
        
        // Keep the loading state until we get the OAuth callback
      } else if (data.setup_required) {
        // Show setup instructions modal
        setInstagramInstructions(data.instructions);
        setShowInstagramSetup(true);
        setConnectingPlatform(null);
      } else {
        setError(data.error || 'Failed to start Instagram OAuth');
        setConnectingPlatform(null);
      }
    } catch (err) {
      setError('Failed to connect to Instagram. Is the backend running?');
      setConnectingPlatform(null);
    }
  };

  const handleDiscordConnect = async () => {
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      setError('Invalid Discord webhook URL');
      return;
    }

    setConnectingPlatform('discord');
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/accounts/discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          webhook_url: webhookUrl,
          server_name: serverName || 'Discord Server'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Discord connected successfully!');
        setConnectedAccounts(prev => ({ ...prev, discord: serverName || 'Discord Server' }));
        setShowDiscordModal(false);
        setWebhookUrl('');
        setServerName('');
      } else {
        setError(data.detail || 'Failed to connect Discord');
      }
    } catch (err) {
      setError('Failed to connect Discord. Is the backend running?');
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    // Find account ID and disconnect
    try {
      const response = await fetch(`${API_BASE}/accounts?user_id=${userId}`);
      const data = await response.json();
      const account = data.accounts?.find((a: any) => a.platform === platformId);
      
      if (account) {
        await fetch(`${API_BASE}/accounts/${account.id}?user_id=${userId}`, {
          method: 'DELETE'
        });
        setConnectedAccounts(prev => {
          const updated = { ...prev };
          delete updated[platformId];
          return updated;
        });
        setSuccess(`${platformId.charAt(0).toUpperCase() + platformId.slice(1)} disconnected`);
      }
    } catch (err) {
      setError('Failed to disconnect account');
    }
  };

  // Design tokens
  const colors = {
    bg: isDark ? 'bg-[#0A0A0F]' : 'bg-white',
    surface: isDark ? 'bg-white/[0.03]' : 'bg-gray-50',
    surfaceHover: isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100',
    border: isDark ? 'border-white/10' : 'border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-white/50' : 'text-gray-500',
  };

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} p-8`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Connect Your Accounts</h1>
            <p className={colors.textMuted}>
              Link your social media platforms for auto-posting and scheduling
            </p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl ${colors.surface} ${colors.surfaceHover} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400">{success}</span>
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <X className="w-4 h-4 text-emerald-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Platform Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const isConnected = platform.id in connectedAccounts;
              const Icon = platform.icon;
              
              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative overflow-hidden rounded-2xl border ${colors.border} ${colors.surface} p-6 transition-all duration-300 ${colors.surfaceHover}`}
                >
                  {/* Gradient accent */}
                  <div 
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${platform.gradient}`}
                    style={{ opacity: isConnected ? 1 : 0.3 }}
                  />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Platform Icon */}
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${platform.gradient}`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{platform.name}</h3>
                          {platform.free && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                              FREE
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${colors.textMuted}`}>
                          {isConnected ? connectedAccounts[platform.id] : platform.description}
                        </p>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                            <Check className="w-4 h-4" />
                            Connected
                          </span>
                          <button
                            onClick={() => handleDisconnect(platform.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(platform.id, platform.method)}
                          disabled={connectingPlatform === platform.id}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r ${platform.gradient} text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2`}
                        >
                          {connectingPlatform === platform.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : platform.method === 'extension' ? (
                            <ExternalLink className="w-4 h-4" />
                          ) : (
                            <Link2 className="w-4 h-4" />
                          )}
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Method badge */}
                  <div className={`mt-4 text-xs ${colors.textMuted} flex items-center gap-2`}>
                    {platform.method === 'webhook' && <Zap className="w-3 h-3" />}
                    {platform.method === 'oauth' && <Link2 className="w-3 h-3" />}
                    {platform.method === 'extension' && <ExternalLink className="w-3 h-3" />}
                    <span className="capitalize">{platform.method}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Feature Highlights */}
        <div className={`mt-12 grid grid-cols-1 md:grid-cols-3 gap-6`}>
          {[
            { icon: Calendar, title: 'Auto-Schedule', desc: 'Set it and forget it' },
            { icon: Clock, title: '60s Checks', desc: 'Posts go live on time' },
            { icon: Zap, title: '100% Free', desc: 'No hidden API costs' },
          ].map((feature, i) => (
            <div 
              key={i}
              className={`p-6 rounded-2xl ${colors.surface} border ${colors.border} text-center`}
            >
              <feature.icon className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
              <h4 className="font-semibold mb-1">{feature.title}</h4>
              <p className={`text-sm ${colors.textMuted}`}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Discord Webhook Modal */}
      <AnimatePresence>
        {showDiscordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDiscordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl ${isDark ? 'bg-[#0A0A0F]' : 'bg-white'} border ${colors.border} p-6`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5865F2] to-[#7289DA] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Connect Discord</h3>
                  <p className={`text-sm ${colors.textMuted}`}>Enter your webhook URL</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textMuted}`}>
                    Webhook URL *
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className={`w-full px-4 py-3 rounded-xl ${colors.surface} border ${colors.border} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${colors.text}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textMuted}`}>
                    Server Name (optional)
                  </label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="My Startup Community"
                    className={`w-full px-4 py-3 rounded-xl ${colors.surface} border ${colors.border} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${colors.text}`}
                  />
                </div>

                {/* How to get webhook */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${colors.textMuted}`}>
                    <strong>How to get a webhook:</strong><br />
                    Server Settings → Integrations → Webhooks → New Webhook
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDiscordModal(false)}
                    className={`flex-1 px-4 py-3 rounded-xl ${colors.surface} ${colors.surfaceHover} font-medium transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDiscordConnect}
                    disabled={!webhookUrl || connectingPlatform === 'discord'}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {connectingPlatform === 'discord' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Connect
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instagram Setup Instructions Modal */}
      <AnimatePresence>
        {showInstagramSetup && instagramInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowInstagramSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-2xl ${isDark ? 'bg-[#0A0A0F]' : 'bg-white'} border ${colors.border} p-6 max-h-[80vh] overflow-y-auto`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F56040] via-[#E4405F] to-[#833AB4] flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Instagram Setup Required</h3>
                  <p className={`text-sm ${colors.textMuted}`}>Follow these steps to enable Instagram OAuth</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(instagramInstructions)
                  .filter(([key]) => key.startsWith('step'))
                  .sort()
                  .map(([key, value]) => (
                    <div 
                      key={key}
                      className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} border ${colors.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-[#F56040] to-[#833AB4] text-white text-sm font-bold flex items-center justify-center">
                          {key.replace('step', '')}
                        </span>
                        <p className={`${colors.text} text-sm leading-relaxed`}>{value as string}</p>
                      </div>
                    </div>
                  ))}

                {instagramInstructions.note && (
                  <div className={`p-4 rounded-xl bg-amber-500/10 border border-amber-500/20`}>
                    <p className="text-amber-400 text-sm">
                      <strong>⚠️ Important:</strong> {instagramInstructions.note}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setShowInstagramSetup(false)}
                  className={`flex-1 px-4 py-3 rounded-xl ${colors.surface} ${colors.surfaceHover} font-medium transition-colors`}
                >
                  Close
                </button>
                <a
                  href="https://developers.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#F56040] via-[#E4405F] to-[#833AB4] text-white font-medium text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Meta Developer
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instagram Account Selection Modal */}
      <AnimatePresence>
        {showInstagramAccountsModal && instagramOAuthData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowInstagramAccountsModal(false);
              setInstagramOAuthData(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl ${isDark ? 'bg-[#0A0A0F]' : 'bg-white'} border ${colors.border} p-6`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F56040] via-[#E4405F] to-[#833AB4] flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Select Instagram Account</h3>
                  <p className={`text-sm ${colors.textMuted}`}>Choose which account to connect</p>
                </div>
              </div>

              <div className="space-y-3">
                {instagramOAuthData.accounts.map((account: any) => (
                  <button
                    key={account.instagram_id}
                    onClick={() => connectInstagramAccount(
                      account, 
                      instagramOAuthData.access_token, 
                      instagramOAuthData.expires_at
                    )}
                    className={`w-full p-4 rounded-xl ${colors.surface} border ${colors.border} ${colors.surfaceHover} transition-all flex items-center gap-4 text-left`}
                  >
                    {account.profile_picture ? (
                      <img 
                        src={account.profile_picture} 
                        alt={account.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F56040] to-[#833AB4] flex items-center justify-center">
                        <Instagram className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">@{account.username}</p>
                      <p className={`text-sm ${colors.textMuted}`}>
                        {account.followers?.toLocaleString() || 0} followers · {account.media_count || 0} posts
                      </p>
                      <p className={`text-xs ${colors.textMuted}`}>
                        via {account.page_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowInstagramAccountsModal(false);
                  setInstagramOAuthData(null);
                }}
                className={`w-full mt-4 px-4 py-3 rounded-xl ${colors.surface} ${colors.surfaceHover} font-medium transition-colors`}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectAccounts;
