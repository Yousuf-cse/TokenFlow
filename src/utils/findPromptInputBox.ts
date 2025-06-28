const findPromptInputBox = (): HTMLTextAreaElement | HTMLInputElement | HTMLElement | null => {
  const keywordHints = ["ask", "message", "prompt", "talk", "say", "type", "question", "query", "write", "grok", "gemini", "claude"];

  // Generic selectors
  const baseSelectors = [
    'textarea',
    'input[type="text"]',
    'input:not([type])',
    'div[contenteditable="true"]'
  ];

  // Get all potential input elements
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(baseSelectors.join(',')));

  // Helper to check visibility
  const isVisible = (el: HTMLElement): boolean => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      rect.width > 20 &&
      rect.height > 10 &&
      rect.bottom <= window.innerHeight &&
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      parseFloat(style.opacity || "1") > 0
    );
  };

  const getTextClues = (el: HTMLElement): string => {
    const attrs = [
      el.getAttribute("placeholder"),
      el.getAttribute("aria-label"),
      el.getAttribute("label"),
      el.getAttribute("name"),
      el.getAttribute("data-placeholder"),
      el.id,
      el.className
    ];
    return attrs.filter(Boolean).map(s => s!.toLowerCase()).join(" ");
  };

  // Score and filter visible elements
  const scored = candidates
    .filter(isVisible)
    .map(el => {
      const clues = getTextClues(el);
      let score = keywordHints.reduce((acc, kw) => clues.includes(kw) ? acc + 1 : acc, 0);

      // Boost score for known editor classnames
      if (/prosemirror|editor|chat|ql-editor/i.test(clues)) score += 2;

      return { el, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) return scored[0].el;

  // ---------- HARDCODED FALLBACKS FOR KNOWN AI PLATFORMS ----------

  // ChatGPT
  const chatgpt = document.querySelector('.ProseMirror#prompt-textarea');
  if (chatgpt instanceof HTMLElement && chatgpt.isContentEditable) return chatgpt;

  // Gemini
  const gemini = document.querySelector('.ql-editor.textarea.new-input-ui[contenteditable="true"]');
  if (gemini instanceof HTMLElement) return gemini;

  // Claude
  const claude = document.querySelector('div[contenteditable="true"].ProseMirror[aria-label="Write your prompt to Claude"]');
  if (claude instanceof HTMLElement) return claude;

  // Grok
  const grok = document.querySelector('textarea[aria-label="Ask Grok anything"]');
  if (grok instanceof HTMLTextAreaElement) return grok;

  // Last-chance: anything visible and editable in lower screen
  return candidates.find(el => {
    const rect = el.getBoundingClientRect();
    const editable = el.isContentEditable || ['textarea', 'input'].includes(el.tagName.toLowerCase());
    return isVisible(el) && editable && rect.top > window.innerHeight * 0.5;
  }) || null;
};

export default findPromptInputBox;


