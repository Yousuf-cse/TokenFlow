import superOptimizePrompt from "@/PromptOptimizer/superOptimizePrompt";

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "start-extension") {
    console.log("received start-extension message");
    sendResponse({ reply: "Hello from background", success: true });
    return;
  }

  if (message.type === "optimize") {
    try {
      const output = superOptimizePrompt(message.prompt);
      sendResponse(output || message.prompt);
    } catch (err) {
      console.log("Error in background.js while optimizing:", err);
      sendResponse(message.prompt);
    }
    return;
  }
});
