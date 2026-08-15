/**
 * Ported from chat-widget/logic/sse.ts. The wire format is frozen: `data: {"text":"..."}\n`
 * lines, optionally one `data: {"suggestions":[...]}\n`, terminated by `data: [DONE]\n` --
 * matches SseStreamBuilder on the PHP side exactly.
 */
window.GHChat = window.GHChat || {};

(function (GHChat) {
  "use strict";

  function splitBuffer(buffer) {
    var lines = buffer.split("\n");
    var remainder = lines.pop();
    return { events: lines, remainder: remainder === undefined ? "" : remainder };
  }

  // Returns { type: "text", text } | { type: "suggestions", suggestions } | null
  function parseLine(line) {
    if (line.indexOf("data: ") !== 0) return null;
    var payload = line.slice(6).replace(/^\s+|\s+$/g, "");
    if (payload === "" || payload === "[DONE]") return null;

    try {
      var parsed = JSON.parse(payload);
      if (typeof parsed.text === "string") return { type: "text", text: parsed.text };
      if (Object.prototype.toString.call(parsed.suggestions) === "[object Array]") {
        return { type: "suggestions", suggestions: parsed.suggestions };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  GHChat.sse = { splitBuffer: splitBuffer, parseLine: parseLine };
})(window.GHChat);
