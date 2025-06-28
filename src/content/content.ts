import findPromptInputBox from "../utils/findPromptInputBox"; 
import getPromptInputValue from "../utils/getPromptInputValue";
import setPromptInputValue from "../utils/setPromptInputValue";
import { findSubmitButton } from "../utils/findSubmitButton";

let currentButton: HTMLElement | null = null;
let observer: MutationObserver | null = null;
let isOptimizing = false;
let skipNextClick = false;

const handleSubmit = async () => {
  const inputBox = findPromptInputBox();
  if (!inputBox) return;

  const value = getPromptInputValue(inputBox);
  if (!value.trim()) return;

  console.log("Original prompt:", value);
  isOptimizing = true;

  chrome.runtime.sendMessage({ type: "optimize", prompt: value }, (response) => {
    console.log("Optimized prompt:", response);
    setPromptInputValue(inputBox, response);  
    isOptimizing = false;
    setTimeout(() => {
      skipNextClick = true;
      currentButton?.click();
    }, 30);
  });
};

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
    if (document.activeElement === inputBox || inputBox.contains(document.activeElement)) {
      e.preventDefault();
      e.stopPropagation();
      if (!isOptimizing) handleSubmit();
    }
  }
};

const observeAndBind = () => {
  currentButton = findSubmitButton();
  observer = new MutationObserver(() => {
    const found = findSubmitButton();
    if (found && found !== currentButton) {
      currentButton = found;
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("click", handleClick, true);
  document.addEventListener("keydown", handleKeydown, true);
};

const cleanup = () => {
  document.removeEventListener("click", handleClick, true);
  document.removeEventListener("keydown", handleKeydown, true);
  observer?.disconnect();
};

window.addEventListener("load", () => {
  cleanup();
  observeAndBind();
});

window.addEventListener("beforeunload", cleanup);

chrome.runtime.sendMessage({ type: "start-extension" }, (response) => {
  if (chrome.runtime.lastError) {
    console.log("[error] start message failed:", chrome.runtime.lastError.message);
    return;
  }
  if (response?.success) console.log("success from background.");
  else console.log("error from background");
});
