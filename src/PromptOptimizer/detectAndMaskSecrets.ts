export interface SecretDetection {
  type: string;
  pattern: string;
  line: number;
  masked: string;
  severity: "high" | "medium" | "low";
}
export const detectAndMaskSecrets = (
  text: string,
  lineNumber: number
): {
  maskedText: string;
  detections: SecretDetection[];
} => {
  const detections: SecretDetection[] = [];
  let maskedText = text;

  const secretPatterns = [
    {
      name: "API Key Assignment",
      regex:
        /\b([A-Z][A-Z0-9_]*(?:SECRET|KEY|PASSWORD|TOKEN|AUTH|CREDENTIAL|PASS|PWD))\s*=\s*([^\n\r\s]+)/gi,
      severity: "high" as const,
      replacer: (_: string, key: string) => {
        detections.push({
          type: "Environment Variable",
          pattern: `${key}=***`,
          line: lineNumber,
          masked: `${key}=***************`,
          severity: "high",
        });
        return `${key}=***************`;
      },
    },
    {
      name: "Generic Secret Pattern",
      regex:
        /\b([A-Z][A-Z0-9_]+)\s*=\s*(sk_[a-zA-Z0-9_]+|pk_[a-zA-Z0-9_]+|[a-f0-9]{32,}|[A-Za-z0-9+/]{20,}={0,2})\b/g,
      severity: "high" as const,
      replacer: (_: string, key: string, value: string) => {
        detections.push({
          type: "Potential Secret",
          pattern: `${key}=${value.substring(0, 4)}...`,
          line: lineNumber,
          masked: `${key}=***************`,
          severity: "high",
        });
        return `${key}=***************`;
      },
    },
    {
      name: "Connection String",
      regex: /(mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]+@[^\s\n]+/gi,
      severity: "high" as const,
      replacer: (match: string) => {
        const protocol = match.split("://")[0];
        const afterCredentials = match.split("@").slice(1).join("@");
        detections.push({
          type: "Database Connection String",
          pattern: `${protocol}://***:***@...`,
          line: lineNumber,
          masked: `${protocol}://***:***@${afterCredentials}`,
          severity: "high",
        });
        return `${protocol}://***:***@${afterCredentials}`;
      },
    },
    {
      name: "Key-Value Secret",
      regex:
        /\b(password|pwd|pass|token|auth|bearer|key|secret|credential)\s*[:=]\s*([^\s\n]+)/gi,
      severity: "medium" as const,
      replacer: (_: string, key: string) => {
        detections.push({
          type: "Key-Value Secret",
          pattern: `${key}=***`,
          line: lineNumber,
          masked: `${key}=***************`,
          severity: "medium",
        });
        return `${key}=***************`;
      },
    },
    {
      name: "API Key Prefix",
      regex: /\b(sk|pk)_[a-zA-Z0-9_]{20,}\b/g,
      severity: "high" as const,
      replacer: (match: string) => {
        const prefix = match.split("_")[0];
        detections.push({
          type: "API Key",
          pattern: `${prefix}_***`,
          line: lineNumber,
          masked: "***************",
          severity: "high",
        });
        return "***************";
      },
    },
  ];

  for (const pattern of secretPatterns) {
    maskedText = maskedText.replace(pattern.regex, pattern.replacer);
  }

  return { maskedText, detections };
};
