export function splitSentences(text: string): string[] {
  return (
    text
      .match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}
