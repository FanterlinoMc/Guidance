/**
 * Ported from chat-widget/ui/ChatWidget.tsx + ChatPanel.tsx. The entry point: mounts a floating
 * bubble on the host page, swaps to the full panel on click, and re-renders the panel's dynamic
 * parts whenever ChatSession notifies of a change.
 *
 * Embed on the host page with, in this order (no build step):
 *   <link rel="stylesheet" href="/chat-widget/chat-widget.css">
 *   <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
 *   <script src="/chat-widget/session-storage.js"></script>
 *   <script src="/chat-widget/sse-parser.js"></script>
 *   <script src="/chat-widget/multilingual.js"></script>
 *   <script src="/chat-widget/render-markdown.js"></script>
 *   <script src="/chat-widget/typing-indicator.js"></script>
 *   <script src="/chat-widget/quick-replies.js"></script>
 *   <script src="/chat-widget/chat-input.js"></script>
 *   <script src="/chat-widget/message-list.js"></script>
 *   <script src="/chat-widget/chat-session.js"></script>
 *   <script src="/chat-widget/chat-widget.js"></script>
 */
window.GHChat = window.GHChat || {};

(function (GHChat, $) {
  "use strict";

  function svgIcon() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    $(svg).attr({ width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2 });
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    $(path).attr(
      "d",
      "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
    );
    svg.appendChild(path);
    return $(svg);
  }

  function renderBubble($root, onOpen) {
    $root.empty();
    $('<button type="button" class="gh-chat-bubble-launcher" aria-label="Chat with the Guidance Assistant">')
      .append($('<span class="gh-chat-bubble-icon">').append(svgIcon()))
      .append($('<span class="gh-chat-bubble-label">Chat with us</span>'))
      .on("click", onOpen)
      .appendTo($root);
  }

  function renderHeader($panel, compact, onClose) {
    var $header = $('<div class="gh-chat-header">').toggleClass("gh-chat-header--compact", compact);
    var $badge = $('<span class="gh-chat-header-badge">G</span>');
    var $titleBlock = $('<div>').append($('<p class="gh-chat-header-title">Guidance Assistant</p>'));
    if (!compact) {
      $titleBlock.append($('<p class="gh-chat-header-subtitle">Typically replies instantly</p>'));
    }
    $header
      .append($('<div class="gh-chat-header-identity">').append($badge).append($titleBlock))
      .append(
        $('<button type="button" class="gh-chat-header-close" aria-label="Close chat">&times;</button>').on(
          "click",
          onClose
        )
      );
    $panel.append($header);
  }

  function renderGreeting($panel) {
    $panel.append(
      $('<p class="gh-chat-greeting">').text(
        "Hi! I can help explain Guidance's Shariah-compliant home financing, or connect you with an Account Executive."
      )
    );
  }

  function renderFooter($panel) {
    $panel.append($('<p class="gh-chat-footer">Equal Housing Lender · NMLS #2908</p>'));
  }

  function GuidanceChatWidget() {
    this.session = new GHChat.ChatSession();
    this.$root = $('<div class="gh-chat-root">');
    this.isOpen = false;
    this._messageList = null;

    var self = this;
    this.session.onChange(function () {
      if (self.isOpen) self._renderPanel();
    });
  }

  GuidanceChatWidget.prototype.mount = function () {
    $(document.body).append(this.$root);
    this._renderBubble();
  };

  GuidanceChatWidget.prototype._renderBubble = function () {
    var self = this;
    renderBubble(this.$root, function () {
      self.isOpen = true;
      self._renderPanel();
    });
  };

  GuidanceChatWidget.prototype._renderPanel = function () {
    var self = this;
    var session = this.session;
    var messages = session.messages;
    var showGreeting = messages.length === 0;
    var hasStartedConversation = messages.length > 0;
    var lastMessage = messages[messages.length - 1];
    var hasCompletedReply =
      !session.isStreaming && lastMessage && lastMessage.role === "assistant" && lastMessage.content !== "";
    var showQuickReplies = showGreeting || hasCompletedReply;

    this.$root.empty();
    var $panel = $('<div class="gh-chat-panel">');

    renderHeader($panel, hasStartedConversation, function () {
      self.isOpen = false;
      self._renderBubble();
    });
    if (showGreeting) renderGreeting($panel);

    var $messages = $('<div>');
    $panel.append($messages);
    this._messageList = new GHChat.MessageList($messages);
    this._messageList.render(messages, session.isStreaming);

    if (showQuickReplies) {
      var lastUserMessage = null;
      for (var i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          lastUserMessage = messages[i];
          break;
        }
      }
      var fallbackLanguage = showGreeting
        ? "other"
        : GHChat.multilingual.detectLanguageBucket(lastUserMessage ? lastUserMessage.content : "");
      var repliesToShow =
        session.suggestions.length > 0
          ? session.suggestions
          : GHChat.FALLBACK_QUICK_REPLIES_BY_LANGUAGE[fallbackLanguage];

      var $quickReplies = $('<div>');
      $panel.append($quickReplies);
      GHChat.renderQuickReplies($quickReplies, repliesToShow, function (text) {
        session.sendMessage(text);
      });
    }

    var $input = $('<div>');
    $panel.append($input);
    GHChat.renderChatInput($input, session.isStreaming, function (text) {
      session.sendMessage(text);
    });

    // The compliance line is already appended to every substantive financing reply (see the
    // system prompt's Compliance footer instruction) -- once a conversation is under way, this
    // persistent footer is redundant chrome, so it only shows on the idle/greeting screen.
    if (!hasStartedConversation) renderFooter($panel);

    this.$root.append($panel);
  };

  function boot() {
    var widget = new GuidanceChatWidget();
    widget.mount();
    GHChat.widget = widget;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.GHChat, jQuery);
