export interface SSESplit {
  events: string[];
  remainder: string;
}

export function splitSSEBuffer(buffer: string): SSESplit {
  const lines = buffer.split("\n");
  const remainder = lines.pop() ?? "";
  return { events: lines, remainder };
}

export function parseSSELine(line: string): string | null {
  if (!line.startsWith("data: ")) return null;
  const payload = line.slice(6).trim();
  if (payload === "" || payload === "[DONE]") return null;
  try {
    const parsed = JSON.parse(payload) as { text?: string };
    return parsed.text ?? null;
  } catch {
    return null;
  }
}
