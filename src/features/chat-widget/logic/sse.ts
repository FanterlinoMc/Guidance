export interface SSESplit {
  events: string[];
  remainder: string;
}

export function splitSSEBuffer(buffer: string): SSESplit {
  const lines = buffer.split("\n");
  const remainder = lines.pop() ?? "";
  return { events: lines, remainder };
}

export type SSEEvent = { type: "text"; text: string } | { type: "suggestions"; suggestions: string[] };

export function parseSSELine(line: string): SSEEvent | null {
  if (!line.startsWith("data: ")) return null;
  const payload = line.slice(6).trim();
  if (payload === "" || payload === "[DONE]") return null;
  try {
    const parsed = JSON.parse(payload) as { text?: string; suggestions?: string[] };
    if (typeof parsed.text === "string") return { type: "text", text: parsed.text };
    if (Array.isArray(parsed.suggestions)) return { type: "suggestions", suggestions: parsed.suggestions };
    return null;
  } catch {
    return null;
  }
}
