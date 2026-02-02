/**
 * FounderOS Extension Popup - Production Version
 */

const queuedCount = document.getElementById('queued-count');
const postedCount = document.getElementById('posted-count');
const postsContainer = document.getElementById('posts-container');
const emptyState = document.getElementById('empty-state');
const postNowBtn = document.getElementById('post-now-btn');
const refreshBtn = document.getElementById('refresh-btn');

let posts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadQueue();
  
  postNowBtn.addEventListener('click', postAllNow);
  refreshBtn.addEventListener('click', loadQueue);
});

async function loadQueue() {
  refreshBtn.textContent = '⏳ Loading...';
  
  chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
    if (response) {
      posts = response.posts || [];
      renderPosts();
    }
    refreshBtn.textContent = '🔄 Refresh Queue';
  });
}

function renderPosts() {
  queuedCount.textContent = posts.length;
  
  // Get posted count from storage
  chrome.storage.local.get(['postedToday'], (result) => {
    postedCount.textContent = result.postedToday || 0;
  });
  
  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✨</div>
        <div>No posts in queue</div>
      </div>
    `;
    postNowBtn.disabled = true;
    postNowBtn.style.opacity = '0.5';
    return;
  }
  
  postNowBtn.disabled = false;
  postNowBtn.style.opacity = '1';
  
  postsContainer.innerHTML = posts.map(post => `
    <div class="post-item">
      <div class="post-header">
        <span class="platform-badge ${post.platform}">${post.platform.toUpperCase()}</span>
        ${post.scheduled_time ? `<span style="font-size: 10px; color: rgba(255,255,255,0.5)">⏰ Scheduled</span>` : ''}
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
    </div>
  `).join('');
}

async function postAllNow() {
  postNowBtn.innerHTML = '<div class="spinner"></div> Posting...';
  postNowBtn.disabled = true;
  
  chrome.runtime.sendMessage({ action: 'PROCESS_NOW' }, (response) => {
    if (response && response.success) {
      postNowBtn.innerHTML = '✅ Done!';
      
      // Update posted count
      chrome.storage.local.get(['postedToday'], (result) => {
        const count = (result.postedToday || 0) + posts.length;
        chrome.storage.local.set({ postedToday: count });
        postedCount.textContent = count;
      });
      
      setTimeout(() => {
        postNowBtn.innerHTML = '🚀 Post All Now';
        postNowBtn.disabled = false;
        loadQueue();
      }, 2000);
    } else {
      postNowBtn.innerHTML = '❌ Error';
      setTimeout(() => {
        postNowBtn.innerHTML = '🚀 Post All Now';
        postNowBtn.disabled = false;
      }, 2000);
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
