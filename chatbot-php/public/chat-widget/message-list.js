/**
 * Ported from chat-widget/ui/MessageList.tsx + MessageBubble.tsx. No virtual-DOM diffing here --
 * each render() call rebuilds the message list from scratch, which is fine at chat-widget scale
 * and keeps this file simple. Scroll-anchoring behavior is preserved: a new user message scrolls
 * the bottom into view, a new assistant reply anchors to its own top (not the list bottom) so a
 * long streamed reply doesn't keep re-snapping down and hiding its own beginning.
 */
window.GHChat = window.GHChat || {};

(function (GHChat, $) {
  "use strict";

  function messageBubble(message) {
    var isUser = message.role === "user";
    var $bubble = $('<div class="gh-chat-bubble">')
      .addClass(isUser ? "gh-chat-bubble--user" : "gh-chat-bubble--assistant")
      .attr("dir", GHChat.multilingual.isRTL(message.content) ? "rtl" : "ltr");

    var nodes = GHChat.renderMarkdown(message.content);
    for (var i = 0; i < nodes.length; i++) {
      $bubble.append(nodes[i]);
    }
    return $bubble;
  }

  function MessageList($container) {
    this.$container = $container.addClass("gh-chat-messages");
    // Guards against re-anchoring on every streamed delta -- only flips once per assistant turn
    // (its first non-empty delta), matching the original's anchoredMessageId ref.
    this._anchoredMessageId = null;
  }

  MessageList.prototype.render = function (messages, isStreaming) {
    this.$container.empty();

    var lastMessage = messages[messages.length - 1];
    var showTyping = isStreaming && lastMessage && lastMessage.role === "assistant" && lastMessage.content === "";
    var $latestBubble = null;

    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      var isLast = i === messages.length - 1;
      // Skip the empty assistant placeholder bubble while its first delta hasn't arrived --
      // the typing indicator below already represents "assistant is replying".
      if (isLast && message.role === "assistant" && message.content === "") {
        continue;
      }
      var $bubble = messageBubble(message);
      this.$container.append($bubble);
      if (isLast) $latestBubble = $bubble;
    }

    if (showTyping) {
      this.$container.append(GHChat.renderTypingIndicator());
    }

    this._scrollToRelevantPosition(messages, $latestBubble);
  };

  MessageList.prototype._scrollToRelevantPosition = function (messages, $latestBubble) {
    var latest = messages[messages.length - 1];
    if (!latest) return;

    if (latest.role === "user") {
      // The visitor's own message (and the typing indicator that follows) should be visible.
      this.$container.scrollTop(this.$container[0].scrollHeight);
      return;
    }

    if (latest.content !== "" && this._anchoredMessageId !== latest.id && $latestBubble) {
      this._anchoredMessageId = latest.id;
      // Anchor to the START of the reply, not the container's bottom -- bottom-anchoring keeps
      // re-snapping down as a long reply streams in, so only the tail end stays visible.
      var containerTop = this.$container.offset().top;
      var bubbleTop = $latestBubble.offset().top;
      this.$container.scrollTop(this.$container.scrollTop() + (bubbleTop - containerTop));
    }
  };

  GHChat.MessageList = MessageList;
})(window.GHChat, jQuery);
