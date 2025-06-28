export const maskSecrets = (text: string): string => {
  return text
    .replace(
      /([A-Z0-9_]+)\s*=\s*([^\n\r]*)/g,
      (_, key) => `${key}=***************`
    )
    .replace(/(password|pwd|pass)[:\s=]+[^\s\n]+/gi, "$1=***************")
    .replace(/(token|auth|bearer)[:\s=]+[^\s\n]+/gi, "$1=***************")
    .replace(/(key|secret|credential)[:\s=]+[^\s\n]+/gi, "$1=***************")
    .replace(/(api[_-]?key)[:\s=]+[^\s\n]+/gi, "$1=***************")
    .replace(/\b[A-Za-z0-9+/]{20,}={0,2}\b/g, "***************") // Base64-like strings
    .replace(/\b[a-f0-9]{32,}\b/gi, "***************") // Hex strings (MD5, SHA, etc.)
    .replace(/\b(?:sk|pk)_[a-zA-Z0-9_]{20,}\b/g, "***************"); // API keys
};
