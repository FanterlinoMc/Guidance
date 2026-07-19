// Hebrew, Arabic (+ Urdu, which uses the Arabic script), and their extension/
// presentation-form Unicode blocks. Built from numeric code points rather than
// literal characters so no RTL/bidi glyphs sit in this LTR source file.
const RTL_BLOCKS: Array<[number, number]> = [
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x06ff], // Arabic
  [0x0750, 0x077f], // Arabic Supplement
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
];

export function isRTL(text: string): boolean {
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) continue;
    if (RTL_BLOCKS.some(([start, end]) => codePoint >= start && codePoint <= end)) {
      return true;
    }
  }
  return false;
}
