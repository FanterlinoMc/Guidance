/**
 * Ported from chat-widget/logic/use-chat-session.ts. React's useState/useEffect become a plain
 * observer object: mutate this.messages/isStreaming/suggestions, then notify subscribers so
 * chat-widget.js can re-render. Streaming moves from fetch()+ReadableStream to XMLHttpRequest +
 * onprogress (this session's decision, jQuery-3.2-era browser support over the fetch streaming
 * API) -- see the incremental-read note in _streamReply below for why that's not a 1:1 swap.
 */
window.GHChat = window.GHChat || {};

(function (GHChat) {
  "use strict";

  var FALLBACK_ERROR_TEXT = "Sorry, I couldn't reach the assistant just now. Please try again in a moment.";

  function generateId() {
    // crypto.randomUUID() isn't available on the older browser matrix this widget targets --
    // dependency-free RFC-4122-shaped v4 fallback.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function ChatSession() {
    var stored = GHChat.sessionStorage.load();
    this.messages = (stored && stored.messages) || [];
    this.isStreaming = false;
    this.suggestions = [];
    this._listeners = [];
  }

  ChatSession.prototype.onChange = function (fn) {
    this._listeners.push(fn);
  };

  ChatSession.prototype._notify = function () {
    GHChat.sessionStorage.save({ messages: this.messages });
    for (var i = 0; i < this._listeners.length; i++) this._listeners[i]();
  };

  ChatSession.prototype._findMessage = function (id) {
    for (var i = 0; i < this.messages.length; i++) {
      if (this.messages[i].id === id) return this.messages[i];
    }
    return null;
  };

  ChatSession.prototype.sendMessage = function (text) {
    var self = this;
    var userMessage = { id: generateId(), role: "user", content: text };
    var assistantId = generateId();

    // history excludes the empty assistant placeholder below, matching the original's
    // `[...messages, userMessage]` snapshot taken before the placeholder is added.
    var history = this.messages.concat([userMessage]);

    this.messages = history.concat([{ id: assistantId, role: "assistant", content: "" }]);
    this.suggestions = []; // clear the previous turn's suggestions while the new reply streams in
    this.isStreaming = true;
    this._notify();

    this._streamReply(
      history,
      function onDelta(delta) {
        var msg = self._findMessage(assistantId);
        if (msg) msg.content += delta;
        self._notify();
      },
      function onSuggestions(suggestions) {
        self.suggestions = suggestions;
        self._notify();
      },
      function onDone() {
        self.isStreaming = false;
        self._notify();
      },
      function onError() {
        var msg = self._findMessage(assistantId);
        if (msg) msg.content = FALLBACK_ERROR_TEXT;
        self.isStreaming = false;
        self._notify();
      }
    );
  };

  ChatSession.prototype._streamReply = function (history, onDelta, onSuggestions, onDone, onError) {
    var xhr = new XMLHttpRequest();
    // xhr.responseText is cumulative on every progress tick (unlike fetch's ReadableStream,
    // which hands over only the new bytes) -- track how much has already been fed through the
    // SSE parser and only process the new tail each time.
    var processedLength = 0;
    var buffer = "";
    var handledDone = false;

    function processNewText(newText) {
      buffer += newText;
      var split = GHChat.sse.splitBuffer(buffer);
      buffer = split.remainder;
      for (var i = 0; i < split.events.length; i++) {
        var event = GHChat.sse.parseLine(split.events[i]);
        if (!event) continue;
        if (event.type === "text") onDelta(event.text);
        else onSuggestions(event.suggestions);
      }
    }

    function consumeAvailableText() {
      var newText = xhr.responseText.slice(processedLength);
      processedLength = xhr.responseText.length;
      if (newText.length > 0) processNewText(newText);
    }

    xhr.open("POST", "/api/chat", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // Sends the server-issued session cookie even when the widget is embedded cross-origin --
    // harmless no-op for same-origin requests.
    xhr.withCredentials = true;

    xhr.onprogress = function () {
      if (xhr.status < 200 || xhr.status >= 300) return; // let onreadystatechange report the error
      consumeAvailableText();
    };

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4 || handledDone) return;
      handledDone = true;

      if (xhr.status < 200 || xhr.status >= 300) {
        onError();
        return;
      }
      // Catches anything that arrived between the last onprogress tick and completion -- some
      // servers only flush once, so onprogress may never have fired at all.
      consumeAvailableText();
      onDone();
    };

    xhr.onerror = function () {
      if (handledDone) return;
      handledDone = true;
      onError();
    };

    xhr.send(JSON.stringify({ messages: history }));
  };

  GHChat.ChatSession = ChatSession;
})(window.GHChat);
