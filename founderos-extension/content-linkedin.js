/**
 * FounderOS Content Script for LinkedIn
 * 
 * Injects into LinkedIn to post content using LinkedIn's native interface.
 */

// Wait for message from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'POST_CONTENT') {
    postToLinkedIn(message.post).then(success => {
      sendResponse({ success });
    });
    return true; // Keep channel open
  }
});

async function postToLinkedIn(post) {
  try {
    // Click "Start a post" button if on feed
    const startPostBtn = document.querySelector('.share-box-feed-entry__trigger');
    if (startPostBtn) {
      startPostBtn.click();
      await sleep(1000);
    }
    
    // Wait for the post modal/editor
    const editor = await waitForElement('.ql-editor', 5000);
    if (!editor) {
      console.error('Could not find LinkedIn editor');
      return false;
    }
    
    // Focus and type content
    editor.focus();
    
    // Clear any existing content
    editor.innerHTML = '';
    
    // Insert content with proper formatting
    const content = post.content.replace(/\n/g, '<br>');
    editor.innerHTML = `<p>${content}</p>`;
    
    // Trigger input event
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    
    await sleep(500);
    
    // Check if scheduling is needed
    if (post.scheduled_time) {
      // Click schedule button (clock icon)
      const scheduleBtn = document.querySelector('[data-control-name="schedule_post"]') || 
                          document.querySelector('.share-box-footer__schedule-btn');
      
      if (scheduleBtn) {
        scheduleBtn.click();
        await sleep(500);
        
        // LinkedIn scheduling requires date/time picker interaction
        console.log('Scheduling for:', post.scheduled_time);
        
        // Set date and time (simplified)
        const dateInput = document.querySelector('input[type="date"]');
        const timeInput = document.querySelector('input[type="time"]');
        
        if (dateInput && timeInput) {
          const date = new Date(post.scheduled_time);
          dateInput.value = date.toISOString().split('T')[0];
          timeInput.value = date.toTimeString().slice(0, 5);
          
          dateInput.dispatchEvent(new Event('change', { bubbles: true }));
          timeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Confirm schedule
        const confirmBtn = document.querySelector('[data-control-name="schedule_confirm"]');
        if (confirmBtn) confirmBtn.click();
      }
    } else {
      // Post immediately
      const postBtn = document.querySelector('.share-actions__primary-action') ||
                      document.querySelector('[data-control-name="share.post"]');
      
      if (postBtn) {
        // Human-like delay
        await sleep(randomDelay(800, 2000));
        postBtn.click();
        
        await sleep(2000);
        console.log('Posted to LinkedIn successfully!');
        return true;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
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

console.log('FounderOS LinkedIn Content Script loaded');
