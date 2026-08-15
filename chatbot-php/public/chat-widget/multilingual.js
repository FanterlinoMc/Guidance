/**
 * Ported from multilingual/logic/is-rtl.ts and detect-language-bucket.ts. Built from numeric
 * code points (not literal characters) so no RTL/bidi glyphs sit in this LTR source file --
 * same reasoning as the original.
 */
window.GHChat = window.GHChat || {};

(function (GHChat) {
  "use strict";

  var RTL_BLOCKS = [
    [0x0590, 0x05ff], // Hebrew
    [0x0600, 0x06ff], // Arabic
    [0x0750, 0x077f], // Arabic Supplement
    [0x08a0, 0x08ff], // Arabic Extended-A
    [0xfb50, 0xfdff], // Arabic Presentation Forms-A
    [0xfe70, 0xfeff], // Arabic Presentation Forms-B
  ];

  // Arabic-script letters Urdu uses but standard Arabic does not -- an objective Unicode fact,
  // not a translation judgment call. Persian and other Arabic-script languages also match this
  // and get bucketed as "ur", an accepted approximation (only AR/UR fallback chip sets exist).
  var URDU_ONLY_LETTERS = [0x0679, 0x0688, 0x0691, 0x06ba, 0x06d2, 0x06be, 0x06af];

  var BENGALI_BLOCK = [0x0980, 0x09ff];

  function codePointsOf(text) {
    // String.prototype.codePointAt is ES6 (safe for any browser that also has Promise/fetch,
    // both already required elsewhere in this widget); iterating via Array.from splits on full
    // code points rather than UTF-16 surrogate halves.
    return Array.prototype.map.call(Array.from(text), function (ch) {
      return ch.codePointAt(0);
    });
  }

  function inAnyBlock(codePoint, blocks) {
    for (var i = 0; i < blocks.length; i++) {
      if (codePoint >= blocks[i][0] && codePoint <= blocks[i][1]) return true;
    }
    return false;
  }

  function isRTL(text) {
    var codePoints = codePointsOf(text);
    for (var i = 0; i < codePoints.length; i++) {
      if (inAnyBlock(codePoints[i], RTL_BLOCKS)) return true;
    }
    return false;
  }

  function isUrdu(text) {
    var codePoints = codePointsOf(text);
    for (var i = 0; i < codePoints.length; i++) {
      if (URDU_ONLY_LETTERS.indexOf(codePoints[i]) !== -1) return true;
    }
    return false;
  }

  function isBengali(text) {
    var codePoints = codePointsOf(text);
    for (var i = 0; i < codePoints.length; i++) {
      if (inAnyBlock(codePoints[i], [BENGALI_BLOCK])) return true;
    }
    return false;
  }

  // Buckets text into one of 3 objectively-detectable non-English scripts, or "other" (English,
  // French, Somali -- all Latin script). Used only to pick a static fallback chip set, never for
  // anything guardrail/compliance-related.
  function detectLanguageBucket(text) {
    if (isBengali(text)) return "bn";
    if (isRTL(text)) return isUrdu(text) ? "ur" : "ar";
    return "other";
  }

  GHChat.multilingual = { isRTL: isRTL, detectLanguageBucket: detectLanguageBucket };
})(window.GHChat);
