import findPromptInputBox from "../utils/findPromptInputBox";
import getPromptInputValue from "../utils/getPromptInputValue";
import setPromptInputValue from "../utils/setPromptInputValue";
import { findSubmitButton } from "../utils/findSubmitButton";
import showToast from "../components/animations/showToast";

let currentButton: HTMLElement | null = null;
let observer: MutationObserver | null = null;
let isOptimizing = false;
let skipNextClick = false;
let isBound = false;

// --- Main logic ---
const handleSubmit = async () => {
  const inputBox = findPromptInputBox();
  if (!inputBox) {
    console.log("Input box not found.");
    return;
  }

  const value = getPromptInputValue(inputBox);
  if (!value || value.trim() === "") {
    console.log("Prompt is empty.");
    return;
  }

  console.log("Original prompt:", value);
  isOptimizing = true;

  chrome.runtime.sendMessage({ type: "optimize", prompt: value }, (response) => {
    if (!response) {
      console.warn("No response received from optimization.");
      isOptimizing = false;
      return;
    }

    console.log("Optimized prompt:", response);
    setPromptInputValue(inputBox, response.optimized);

    if (response.tokensSaved) {
      showToast(`Saved ${response.tokensSaved} tokens ✅`);
    }

    isOptimizing = false;

    setTimeout(() => {
      skipNextClick = true;
      currentButton?.click();
    }, 30);
  });
};

// --- Events ---
const handleClick = (e: MouseEvent) => {
  if (!currentButton) return;
  const target = e.target as HTMLElement;

  if (target === currentButton || currentButton.contains(target)) {
    if (skipNextClick) {
      skipNextClick = false;
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (!isOptimizing) handleSubmit();
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    const inputBox = findPromptInputBox();
    if (!inputBox) return;

    if (
      document.activeElement === inputBox ||
      inputBox.contains(document.activeElement)
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (!isOptimizing) handleSubmit();
    }
  }
};

// --- Observer & Binding ---
const observeAndBind = () => {
  if (isBound) return;
  isBound = true;

  currentButton = findSubmitButton();
  if (currentButton) {
    console.log("Initial submit button detected");
  }

  observer = new MutationObserver(() => {
    const found = findSubmitButton();
    if (found && found !== currentButton) {
      currentButton = found;
      console.log("Updated submit button reference");
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("click", handleClick, true);
  document.addEventListener("keydown", handleKeydown, true);
};

const cleanup = () => {
  if (!isBound) return;
  isBound = false;

  document.removeEventListener("click", handleClick, true);
  document.removeEventListener("keydown", handleKeydown, true);
  observer?.disconnect();
};

// --- Toggle Watcher ---
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && "isEnabled" in changes) {
    const newValue = changes.isEnabled.newValue;
    console.log("Toggle changed:", newValue);

    if (newValue === false) {
      cleanup();
    } else {
      observeAndBind();
    }
  }
});

// --- Init ---
window.addEventListener("load", () => {
  cleanup(); // Clean before setup

  chrome.storage.local.get("isEnabled", (res) => {
    if (res.isEnabled !== false) {
      observeAndBind(); // Default to enabled
    } else {
      console.log("Extension is disabled by user.");
    }
  });
});

window.addEventListener("beforeunload", cleanup);

// --- Background init ping ---
chrome.runtime.sendMessage({ type: "start-extension" }, (response) => {
  if (chrome.runtime.lastError) {
    console.error("Start-extension message failed:", chrome.runtime.lastError.message);
    return;
  }

  if (response?.success) {
    console.log("Extension initialized successfully from background.");
  } else {
    console.warn("Extension initialization failed or not acknowledged.");
  }
});
