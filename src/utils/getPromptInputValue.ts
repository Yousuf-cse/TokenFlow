 import getPlainText from "./getPlainText";

const getPromptInputValue = (el: HTMLElement | null): string => {
    if (!el) return "";
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return el.value.trim();
    }
    if (el.isContentEditable) {
      return getPlainText(el);
    }
    return "";
};
  

export default getPromptInputValue;