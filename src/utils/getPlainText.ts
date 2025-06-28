 function getPlainText(el: HTMLElement): string {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let text = "";
    while (walker.nextNode()) {
      text += walker.currentNode.textContent;
    }
    return text.trim();
  }
  
  export default getPlainText;
  