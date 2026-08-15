/**
 * Ported from chat-widget/logic/session-storage.ts. Uses sessionStorage (not localStorage) --
 * the original's deliberate choice: a chat history that survives a tab close but not a fresh
 * visit later.
 */
window.GHChat = window.GHChat || {};

(function (GHChat) {
  "use strict";

  var STORAGE_KEY = "guidance-chat-session";

  function loadSession() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(session) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      // storage unavailable (private-browsing quota, etc.) -- chat still works in-memory
    }
  }

  GHChat.sessionStorage = { load: loadSession, save: saveSession };
})(window.GHChat);
