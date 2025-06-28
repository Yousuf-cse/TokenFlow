// we mast not use model
// we will use wink
//we can do it

import promptTrimOptimizer from "../optimizeLogics/promtTrimOptimizer";

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.type === "start-extension") {
    try {
      console.log("received start-extension message");
    } catch (err) {
      console.error("Some eroor in the background.js: ", err);
    }
    sendResponse("Hello from background");
    return;
  }

  if (message.type === "optimize") {
    try {
      const output = promptTrimOptimizer(message.prompt);
      if (output) {
        sendResponse( output? output: message.prompt );
      }
    } catch (err) {
      console.log("Error from background.js while generating opt output");
      sendResponse(message.prompt);
    }
    return true;
  }
});
