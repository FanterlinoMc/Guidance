// Step 30 (multilingual): the only slice of "language support" verifiable without a
// fluent-speaker review or a live model to grade against -- src/features/multilingual/logic/
// is-rtl.ts is pure Unicode code-point range logic, checkable against the Unicode Consortium's
// published block assignments (objective facts, not translation-correctness judgment calls).
// Built with String.fromCodePoint() rather than pasted literal glyphs, matching is-rtl.ts's own
// convention of keeping RTL/bidi characters out of source files -- this suite needs zero
// language fluency to write or review. The rest of Step 30 (translated hard-prohibition phrases
// for Arabic/Urdu/Bengali/Somali, and grading live model replies in those languages) genuinely
// needs a fluent-speaker review or a live model and is NOT attempted here -- fabricating
// "this Arabic phrase must be blocked" assertions without a fluent speaker to vet them would be
// worse than no test, same reasoning already applied to the fatwa content in Step 9.1.

import { isRTL } from "@/features/multilingual";

interface Case {
  id: string;
  codePoints: number[];
  expected: boolean;
  note: string;
}

const CASES: Case[] = [
  { id: "1. Latin (English)", codePoints: [0x0041, 0x0042, 0x0043], expected: false, note: "'ABC', Basic Latin block" },
  { id: "2. Hebrew letter alef", codePoints: [0x05d0], expected: true, note: "U+05D0, Hebrew block" },
  { id: "3. Arabic letter alef", codePoints: [0x0627], expected: true, note: "U+0627, Arabic block" },
  {
    id: "4. Urdu-specific letter (Arabic script extension)",
    codePoints: [0x0679],
    expected: true,
    note: "U+0679 TTEH, Arabic Extended-A -- Urdu uses the Arabic script plus extensions",
  },
  { id: "5. Arabic Presentation Forms-A", codePoints: [0xfb50], expected: true, note: "U+FB50, presentation-form ligature range" },
  { id: "6. Digits are not RTL on their own", codePoints: [0x0030, 0x0031], expected: false, note: "'01', Basic Latin digits" },
  { id: "7. CJK is not RTL", codePoints: [0x4e2d], expected: false, note: "U+4E2D (Chinese '中'), outside all RTL blocks" },
  {
    id: "8. RTL character anywhere in a mixed string",
    codePoints: [0x0048, 0x0069, 0x0020, 0x0627], // "Hi " + Arabic alef
    expected: true,
    note: "isRTL scans the whole string, not just the first character",
  },
];

function main() {
  let passed = 0;
  let failed = 0;

  for (const testCase of CASES) {
    const text = String.fromCodePoint(...testCase.codePoints);
    const actual = isRTL(text);
    console.log(testCase.id);
    if (actual === testCase.expected) {
      console.log(`  PASS  ${testCase.note} -> isRTL = ${actual}`);
      passed++;
    } else {
      console.log(`  FAIL  ${testCase.note} -> expected isRTL = ${testCase.expected}, got ${actual}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
