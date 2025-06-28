// so we need to set the optimized input value again to the input

export default function setPromptInputValue(
    element: any,
    value: string
  ) {
    if (!element) {
      return;
    }
  
    const isInput = element instanceof HTMLInputElement;
    const isTextarea = element instanceof HTMLTextAreaElement;
  
    if (isInput || isTextarea) {
      element.value = value;
  
      // needed for react i think
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
  
    // contenteditable is used by chatgpt and gemini
    const isEditableDiv = element instanceof HTMLElement && element.isContentEditable;
  
    if (isEditableDiv) {
      element.innerText = value;
  
      element.dispatchEvent(new InputEvent("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
  
    console.log("⚠️ This kind of input box is not supported.");
  }
  