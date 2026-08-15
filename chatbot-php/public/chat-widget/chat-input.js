/**
 * Ported from chat-widget/ui/ChatInput.tsx.
 */
window.GHChat = window.GHChat || {};

(function (GHChat, $) {
  "use strict";

  // Renders the input form into $container (emptied first). onSend(text) fires on submit with
  // the trimmed, non-empty value; the input is cleared afterward, matching the original.
  function renderChatInput($container, disabled, onSend) {
    $container.empty().addClass("gh-chat-input-row");

    var $input = $('<input type="text" class="gh-chat-input" placeholder="Type your question...">').prop(
      "disabled",
      disabled
    );
    var $button = $('<button type="submit" class="gh-chat-send">Send</button>').prop(
      "disabled",
      disabled
    );

    var $form = $('<form class="gh-chat-input-form">').append($input).append($button);

    function updateSendEnabled() {
      var hasText = $input.val().replace(/^\s+|\s+$/g, "").length > 0;
      $button.prop("disabled", disabled || !hasText);
    }

    $input.on("input", updateSendEnabled);
    updateSendEnabled();

    $form.on("submit", function (event) {
      event.preventDefault();
      var trimmed = $input.val().replace(/^\s+|\s+$/g, "");
      if (!trimmed || disabled) return;
      onSend(trimmed);
      $input.val("");
      updateSendEnabled();
    });

    $container.append($form);
    return $input;
  }

  GHChat.renderChatInput = renderChatInput;
})(window.GHChat, jQuery);
