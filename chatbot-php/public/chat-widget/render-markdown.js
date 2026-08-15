/**
 * Ported from chat-widget/logic/render-markdown.tsx. Renders exactly the markdown subset the
 * system prompt promises the model: bold, links, hyphen bullet lists.
 *
 * SECURITY: matches the React original's core safety property -- every node here is built with
 * document.createElement()/.textContent, never .innerHTML/.html() with a concatenated string.
 * There is no HTML-parsing surface for model output (which flows partly from a RAG corpus) to
 * exploit. Link hrefs are scheme-checked below for the same reason: an unrestricted
 * `[x](javascript:...)` would otherwise be a live injection vector.
 */
window.GHChat = window.GHChat || {};

(function (GHChat) {
  "use strict";

  var INLINE_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  // http(s) only, case-insensitive -- rejects javascript:/data:/vbscript: and relative hrefs
  // (the system prompt never promises a relative link, so failing closed matches the original's
  // "new URL(href) throws on relative" behavior without needing the URL constructor).
  var SAFE_HREF_PATTERN = /^https?:\/\//i;

  function isSafeHref(href) {
    return SAFE_HREF_PATTERN.test(href);
  }

  function renderInline(text) {
    var nodes = [];
    var lastIndex = 0;
    var match;

    INLINE_PATTERN.lastIndex = 0;
    while ((match = INLINE_PATTERN.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      var boldText = match[1];
      var linkText = match[2];
      var linkHref = match[3];

      if (boldText !== undefined) {
        var strong = document.createElement("strong");
        strong.textContent = boldText;
        nodes.push(strong);
      } else if (linkText !== undefined && linkHref !== undefined && isSafeHref(linkHref)) {
        var a = document.createElement("a");
        a.href = linkHref;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "gh-chat-link";
        a.textContent = linkText;
        nodes.push(a);
      } else {
        // Either an unsafe-scheme link or a pattern we don't otherwise handle -- keep the
        // original text visible rather than silently dropping it.
        nodes.push(document.createTextNode(match[0]));
      }

      lastIndex = INLINE_PATTERN.lastIndex;
    }

    if (lastIndex < text.length) {
      nodes.push(document.createTextNode(text.slice(lastIndex)));
    }
    return nodes;
  }

  function appendAll(parent, nodes) {
    for (var i = 0; i < nodes.length; i++) {
      parent.appendChild(nodes[i]);
    }
  }

  function nonEmptyLines(block) {
    var lines = block.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length > 0) result.push(lines[i]);
    }
    return result;
  }

  function isBulletList(lines) {
    if (lines.length === 0) return false;
    for (var i = 0; i < lines.length; i++) {
      if (!/^[-*]\s+/.test(lines[i])) return false;
    }
    return true;
  }

  function renderBlock(block) {
    var lines = nonEmptyLines(block);

    if (isBulletList(lines)) {
      var ul = document.createElement("ul");
      ul.className = "gh-chat-list";
      for (var i = 0; i < lines.length; i++) {
        var li = document.createElement("li");
        appendAll(li, renderInline(lines[i].replace(/^[-*]\s+/, "")));
        ul.appendChild(li);
      }
      return ul;
    }

    var p = document.createElement("p");
    for (var j = 0; j < lines.length; j++) {
      if (j > 0) p.appendChild(document.createElement("br"));
      appendAll(p, renderInline(lines[j]));
    }
    return p;
  }

  // Returns an array of DOM nodes -- caller appends them into the message bubble container.
  function renderMarkdown(content) {
    var blocks = content.split(/\n{2,}/);
    var result = [];
    for (var i = 0; i < blocks.length; i++) {
      result.push(renderBlock(blocks[i]));
    }
    return result;
  }

  GHChat.renderMarkdown = renderMarkdown;
})(window.GHChat);
