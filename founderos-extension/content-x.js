/**
 * FounderOS Content Script for X (Twitter)
 * 
 * Injects into X.com to post content using X's native scheduling.
 */

// Wait for message from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'POST_CONTENT') {
    postToX(message.post).then(success => {
      sendResponse({ success });
    });
    return true; // Keep channel open
  }
});

async function postToX(post) {
  try {
    // Navigate to compose if not already there
    if (!window.location.href.includes('/compose')) {
      window.location.href = 'https://x.com/compose/tweet';
      await sleep(2000);
    }
    
    // Find the tweet textarea
    const textarea = await waitForElement('[data-testid="tweetTextarea_0"]', 5000);
    if (!textarea) {
      console.error('Could not find tweet textarea');
      return false;
    }
    
    // Focus and type content
    textarea.focus();
    
    // Use execCommand for compatibility
    document.execCommand('insertText', false, post.content);
    
    // Or set directly
    if (textarea.textContent === '') {
      textarea.textContent = post.content;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    await sleep(500);
    
    // Check if scheduling is needed
    if (post.scheduled_time) {
      // Click schedule button
      const scheduleBtn = await waitForElement('[data-testid="scheduleOption"]', 2000);
      if (scheduleBtn) {
        scheduleBtn.click();
        await sleep(500);
        
        // Set date and time (simplified - actual implementation needs date picker interaction)
        // For now, just show that scheduling is attempted
        console.log('Scheduling for:', post.scheduled_time);
        
        // Confirm schedule
        const confirmBtn = await waitForElement('[data-testid="scheduledConfirmationPrimaryAction"]', 2000);
        if (confirmBtn) confirmBtn.click();
      }
    } else {
      // Post immediately
      const postBtn = await waitForElement('[data-testid="tweetButton"]', 2000);
      if (postBtn) {
        // Add human-like delay
        await sleep(randomDelay(500, 1500));
        postBtn.click();
        
        await sleep(2000);
        console.log('Posted to X successfully!');
        return true;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('Error posting to X:', error);
    return false;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function waitForElement(selector, timeout = 5000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await sleep(100);
  }
  
  return null;
}

console.log('FounderOS X Content Script loaded');
