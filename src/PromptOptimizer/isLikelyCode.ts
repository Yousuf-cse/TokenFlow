export const isLikelyCode = (text: string): boolean => {
  const patterns: RegExp[] = [
    /[{}`;]/, // Common code delimiters
    /\/\*.*?\*\//s, // Block comments
    /\/\/.*$/m, // Line comments
    /\b(const|let|var|function|class|import|export|return|if|else|for|while|switch|case|break|continue)\b/, // JS keywords
    /=>/, // Arrow functions
    /def\s+\w+\s*\(.*?\)\s*:/, // Python functions
    /print\(.+?\)|console\.log\(/, // Print statements
    /<\w+.*?>.*?<\/\w+>/s, // HTML tags
    /^[A-Z0-9_]+\s*=\s*.+/, // Environment variables
    /\$\{.*?\}/, // Template literals
    /\[[^\]]*\]/, // Arrays/lists
    /\w+\(.*?\)/, // Function calls
    /\w+\.\w+/, // Object properties
    /^\s*[\-\*\+]\s+/m, // Markdown lists
    /^\s*\d+\.\s+/m, // Numbered lists
    /```[\s\S]*?```/, // Code blocks
    /`[^`]+`/, // Inline code
    /@\w+/, // Decorators/annotations
    /#\w+/, // Hash tags or preprocessor
    /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i, // SQL
    /\b(public|private|protected|static|void|int|string|boolean|float|double)\b/, // Type keywords
    /\${.*?}/, // Variable substitution
    /\bhttps?:\/\/\S+/, // URLs
  ];
  return patterns.some((regex) => regex.test(text));
};
