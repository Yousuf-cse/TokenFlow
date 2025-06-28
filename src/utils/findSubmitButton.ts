 export function findSubmitButton(): HTMLElement | null {
    const selectors = [
      // ChatGPT
      '#composer-submit-button',
      'button[data-testid="send-button"]',
  
      // Grok
      'button[aria-label="Submit"][type="submit"]',
  
      // Gemini
      'button[aria-label="Send message"]',
      '.send-button',
      '.send-button-icon',
  
      // Claude
      'button[aria-label="Send message"]:not([disabled])',
  
      // Generic fallbacks
      'button[aria-label*="Send"]',
      'button[aria-label*="Submit"]',
      'button[data-testid*="send"]',
      'button[type="submit"]',
      'form button[type="submit"]'
    ];
  
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const button = el.closest("button") || el;
        const ariaLabel = (button.getAttribute("aria-label") || '').toLowerCase();
        if (
          ariaLabel.includes("upload") ||
          ariaLabel.includes("file") ||
          ariaLabel.includes("photo")
        ) {
          continue;
        }
        return button as HTMLElement;
      }
    }
  
    return null;
  }
  


