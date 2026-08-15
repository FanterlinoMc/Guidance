/**
 * Ported from chat-widget/ui/TypingIndicator.tsx.
 */
window.GHChat = window.GHChat || {};

(function (GHChat, $) {
  "use strict";

  function renderTypingIndicator() {
    return $('<div class="gh-chat-typing" aria-label="Assistant is typing">')
      .append($('<span class="gh-chat-typing-dot gh-chat-typing-dot--1">'))
      .append($('<span class="gh-chat-typing-dot gh-chat-typing-dot--2">'))
      .append($('<span class="gh-chat-typing-dot gh-chat-typing-dot--3">'));
  }

  GHChat.renderTypingIndicator = renderTypingIndicator;
})(window.GHChat, jQuery);
