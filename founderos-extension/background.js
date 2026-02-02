/**
 * FounderOS Chrome Extension - Background Service Worker
 * PRODUCTION VERSION - Actual Automated Posting
 * 
 * This extension:
 * 1. Polls the FounderOS backend for queued posts
 * 2. Opens X/LinkedIn in background tab
 * 3. Auto-fills and posts content
 * 4. Supports scheduled posting
 */

const API_BASE = 'http://localhost:8000/api/v1';
const USER_ID = 'demo_user'; // In production, get from auth

// ============================================================================
// STORAGE HELPERS
// ============================================================================

async function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

async function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

// ============================================================================
// API COMMUNICATION
// ============================================================================

async function fetchQueuedPosts() {
  try {
    const response = await fetch(`${API_BASE}/marketing/extension/pending/${USER_ID}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.log('FounderOS: Backend not reachable');
    return [];
  }
}

async function markPostAsPublished(postId) {
  try {
    await fetch(`${API_BASE}/marketing/extension/confirm/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`FounderOS: Post ${postId} confirmed as published`);
  } catch (error) {
    console.error('Error confirming post:', error);
  }
}

// ============================================================================
// POSTING AUTOMATION
// ============================================================================

async function postToTwitter(post) {
  console.log('FounderOS: Posting to X...', post.content.substring(0, 50));
  
  return new Promise(async (resolve) => {
    // Find or create X tab
    let tabs = await chrome.tabs.query({ url: ['*://x.com/*', '*://twitter.com/*'] });
    let tabId;
    
    if (tabs.length > 0) {
      tabId = tabs[0].id;
    } else {
      // Open X compose
      const tab = await chrome.tabs.create({ 
        url: 'https://x.com/compose/tweet',
        active: false // Background tab
      });
      tabId = tab.id;
      
      // Wait for page to load
      await new Promise(r => setTimeout(r, 4000));
    }
    
    // Inject script to post
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: autoPostToX,
        args: [post.content]
      });
      
      if (result && result[0] && result[0].result) {
        await markPostAsPublished(post.id);
        showNotification('Posted to X!', post.content.substring(0, 50) + '...');
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      console.error('FounderOS: Failed to post to X:', e);
      resolve(false);
    }
  });
}

async function postToLinkedIn(post) {
  console.log('FounderOS: Posting to LinkedIn...', post.content.substring(0, 50));
  
  return new Promise(async (resolve) => {
    // Find or create LinkedIn tab
    let tabs = await chrome.tabs.query({ url: '*://www.linkedin.com/*' });
    let tabId;
    
    if (tabs.length > 0) {
      tabId = tabs[0].id;
    } else {
      const tab = await chrome.tabs.create({ 
        url: 'https://www.linkedin.com/feed/',
        active: false
      });
      tabId = tab.id;
      await new Promise(r => setTimeout(r, 4000));
    }
    
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: autoPostToLinkedIn,
        args: [post.content]
      });
      
      if (result && result[0] && result[0].result) {
        await markPostAsPublished(post.id);
        showNotification('Posted to LinkedIn!', post.content.substring(0, 50) + '...');
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      console.error('FounderOS: Failed to post to LinkedIn:', e);
      resolve(false);
    }
  });
}

// These functions run in the page context
function autoPostToX(content) {
  return new Promise(async (resolve) => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    
    try {
      // Click compose if not on compose page
      if (!window.location.href.includes('/compose')) {
        const composeBtn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
        if (composeBtn) {
          composeBtn.click();
          await sleep(1500);
        }
      }
      
      // Find the tweet input
      const tweetBox = document.querySelector('[data-testid="tweetTextarea_0"]') || 
                       document.querySelector('[aria-label="Post text"]') ||
                       document.querySelector('.public-DraftEditor-content');
      
      if (!tweetBox) {
        console.log('FounderOS: Tweet box not found');
        resolve(false);
        return;
      }
      
      // Focus and type
      tweetBox.focus();
      await sleep(300);
      
      // Type character by character for natural input
      document.execCommand('insertText', false, content);
      await sleep(500);
      
      // Find and click the post button
      const postBtn = document.querySelector('[data-testid="tweetButton"]') ||
                      document.querySelector('[data-testid="tweetButtonInline"]');
      
      if (postBtn && !postBtn.disabled) {
        await sleep(1000); // Human-like delay
        postBtn.click();
        await sleep(2000);
        console.log('FounderOS: Tweet posted!');
        resolve(true);
      } else {
        console.log('FounderOS: Post button not clickable');
        resolve(false);
      }
    } catch (e) {
      console.error('FounderOS X Error:', e);
      resolve(false);
    }
  });
}

function autoPostToLinkedIn(content) {
  return new Promise(async (resolve) => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    
    try {
      // Click "Start a post" button
      const startPostBtn = document.querySelector('.share-box-feed-entry__trigger') ||
                          document.querySelector('[data-control-name="share.new_post"]') ||
                          document.querySelector('.artdeco-button--tertiary');
      
      if (startPostBtn) {
        startPostBtn.click();
        await sleep(1500);
      }
      
      // Find the editor
      const editor = document.querySelector('.ql-editor') ||
                    document.querySelector('[data-placeholder="What do you want to talk about?"]') ||
                    document.querySelector('[role="textbox"]');
      
      if (!editor) {
        console.log('FounderOS: LinkedIn editor not found');
        resolve(false);
        return;
      }
      
      // Focus and type
      editor.focus();
      await sleep(300);
      
      // Clear and insert content
      editor.innerHTML = `<p>${content.replace(/\n/g, '</p><p>')}</p>`;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      
      await sleep(1000);
      
      // Find post button
      const postBtn = document.querySelector('.share-actions__primary-action') ||
                      document.querySelector('[data-control-name="share.post"]') ||
                      document.querySelector('button.share-box-feed-entry__closed-share-box btn');
      
      if (postBtn && !postBtn.disabled) {
        await sleep(1500); // Human-like delay
        postBtn.click();
        await sleep(2000);
        console.log('FounderOS: LinkedIn post published!');
        resolve(true);
      } else {
        console.log('FounderOS: LinkedIn post button not found');
        resolve(false);
      }
    } catch (e) {
      console.error('FounderOS LinkedIn Error:', e);
      resolve(false);
    }
  });
}

// ============================================================================
// POST QUEUE PROCESSOR
// ============================================================================

async function processQueue() {
  const posts = await fetchQueuedPosts();
  
  if (posts.length === 0) return;
  
  console.log(`FounderOS: Processing ${posts.length} queued posts...`);
  
  for (const post of posts) {
    // Check if scheduled for future
    if (post.scheduled_time) {
      const scheduledDate = new Date(post.scheduled_time);
      if (scheduledDate > new Date()) {
        console.log(`FounderOS: Post ${post.id} scheduled for ${scheduledDate}`);
        continue; // Skip, not yet time
      }
    }
    
    // Post based on platform
    if (post.platform === 'x') {
      await postToTwitter(post);
    } else if (post.platform === 'linkedin') {
      await postToLinkedIn(post);
    }
    
    // Small delay between posts
    await new Promise(r => setTimeout(r, 3000));
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: `FounderOS: ${title}`,
    message: message
  });
}

// ============================================================================
// LISTENERS
// ============================================================================

// Check for posts every 30 seconds
chrome.alarms.create('check_queue', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check_queue') {
    processQueue();
  }
});

// Also check when extension popup opens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'PROCESS_NOW') {
    processQueue()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(err => {
        console.error('Process queue error:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
  
  if (message.action === 'GET_STATUS') {
    fetchQueuedPosts().then(posts => {
      sendResponse({ posts, count: posts.length });
    });
    return true;
  }
});

// Run once on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('FounderOS Extension installed - Auto-posting enabled');
  showNotification('Extension Ready', 'Auto-posting is now enabled for X and LinkedIn');
});

console.log('FounderOS Background Worker loaded - Checking for posts every 30 seconds');
