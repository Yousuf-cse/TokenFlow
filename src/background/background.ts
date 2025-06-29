import superOptimizePrompt from "../PromptOptimizer/superOptimizePrompt";

const simpleTokenCount = (text: string): number => {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean).length;
};

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "start-extension") {
    console.log("received start-extension message");
    sendResponse({ reply: "Hello from background", success: true });
    return;
  }

  if (message.type === "optimize") {
    try {
      const originalPrompt = message.prompt;
      const output = superOptimizePrompt(originalPrompt);
      const optimizedPrompt = output.optimized || originalPrompt;

      const originalTokenCount = simpleTokenCount(originalPrompt);
      const optimizedTokenCount = simpleTokenCount(optimizedPrompt);
      const tokensSaved = Math.max(0, originalTokenCount - optimizedTokenCount);

      const today = new Date().toISOString().split("T")[0];

      chrome.storage.local.get(["dailyTokenSavings"], (result) => {
        const current = result.dailyTokenSavings || {};
        current[today] = (current[today] || 0) + tokensSaved;

        chrome.storage.local.set({ dailyTokenSavings: current }, () => {
          console.log(`Saved ${tokensSaved} tokens on ${today}`);
        });
      });

      sendResponse({ optimized: optimizedPrompt, tokensSaved });
      console.log(output);
    } catch (err) {
      console.error("Error during optimization:", err);
      sendResponse({ optimized: message.prompt, tokensSaved: 0 });
    }

    return true;
  }
});
