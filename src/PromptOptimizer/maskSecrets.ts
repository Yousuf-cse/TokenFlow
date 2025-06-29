export const maskSecrets = (text: string): string => {
  return (
    text
      // Environment variable assignments (KEY=value format)
      .replace(
        /\b([A-Z][A-Z0-9_]*(?:SECRET|KEY|PASSWORD|TOKEN|AUTH|CREDENTIAL|PASS|PWD))\s*=\s*([^\n\r\s]+)/gi,
        (_, key) => `${key}=***************`
      )
      // Generic environment variables with suspicious patterns
      .replace(
        /\b([A-Z][A-Z0-9_]+)\s*=\s*(sk_[a-zA-Z0-9_]+|pk_[a-zA-Z0-9_]+|[a-f0-9]{32,}|[A-Za-z0-9+/]{20,}={0,2})\b/g,
        (_, key) => `${key}=***************`
      )
      // Connection strings and URLs with credentials
      .replace(
        /(mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]+@[^\s\n]+/gi,
        (match) => {
          const protocol = match.split("://")[0];
          const afterCredentials = match.split("@").slice(1).join("@");
          return `${protocol}://***:***@${afterCredentials}`;
        }
      )
      // Standalone tokens, keys, and secrets (only when clearly identified as such)
      .replace(
        /\b(password|pwd|pass|token|auth|bearer|key|secret|credential)\s*[:=]\s*([^\s\n]+)/gi,
        "$1=***************"
      )
      // Base64-like strings that are likely secrets (standalone, not part of imports/identifiers)
      .replace(
        /(?:^|\s)([A-Za-z0-9+/]{32,}={0,2})(?=\s|$)/g,
        " ***************"
      )
      // Hex strings that are likely secrets (standalone)
      .replace(/(?:^|\s)([a-f0-9]{32,})(?=\s|$)/gi, " ***************")
      // API keys with common prefixes
      .replace(/\b(sk|pk)_[a-zA-Z0-9_]{20,}\b/g, "***************")
  );
};

// Alternative: More conservative version that only masks clear secret patterns
export const maskSecretsConservative = (text: string): string => {
  return (
    text
      // Only mask when it's clearly a key=value assignment with secret-like content
      .replace(
        /^([A-Z][A-Z0-9_]*(?:SECRET|KEY|PASSWORD|TOKEN|PASS|PWD|AUTH))\s*=\s*(.+)$/gm,
        (_, key) => `${key}=***************`
      )
      // Connection strings
      .replace(
        /(mongodb|postgres|mysql|redis):\/\/([^:]+):([^@]+)@/gi,
        "$1://***:***@"
      )
      // API keys with known prefixes
      .replace(/\b(sk|pk)_[a-zA-Z0-9_]{20,}\b/g, "***************")
      // Only mask obvious secret assignments (key: value or key = value)
      .replace(
        /\b(api[_-]?key|secret[_-]?key|password|token)\s*[:=]\s*([^\s\n]+)/gi,
        "$1=***************"
      )
  );
};
