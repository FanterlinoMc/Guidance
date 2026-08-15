/**
 * Ported from chat-widget/ui/QuickReplies.tsx. A single scrollable row of tappable suggestion
 * chips with arrow buttons that only appear on the side there's actually more content --
 * ResizeObserver keeps them correct as the panel resizes, not just as content changes.
 */
window.GHChat = window.GHChat || {};

(function (GHChat, $) {
  "use strict";

  // AR/UR/BN variants are best-effort, not fluent-speaker vetted -- low-stakes generic
  // navigational button labels, not compliance-sensitive content. FR/SO stay bucketed as
  // "other" (Latin script, indistinguishable from English by script alone).
  var FALLBACK_QUICK_REPLIES_BY_LANGUAGE = {
    other: [
      "How does Shariah-compliant financing work?",
      "What's the down payment?",
      "I'd like to talk to someone",
    ],
    ar: ["كيف يعمل التمويل المتوافق مع الشريعة؟", "كم نسبة الدفعة الأولى؟", "أرغب في التحدث مع أحد الموظفين"],
    ur: [
      "شریعت کے مطابق فنانسنگ کیسے کام کرتی ہے؟",
      "پیشگی ادائیگی کتنی ہے؟",
      "میں کسی نمائندے سے بات کرنا چاہتا ہوں",
    ],
    bn: ["শরিয়াহ-সম্মত অর্থায়ন কীভাবে কাজ করে?", "ডাউন পেমেন্ট কত?", "আমি কারো সাথে কথা বলতে চাই"],
  };

  function arrowButton(direction, onClick) {
    var label = direction === "left" ? "Show previous suggestions" : "Show more suggestions";
    var pathD = direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
    var $svg = $(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
      .attr({ width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round" });
    $svg.append($(document.createElementNS("http://www.w3.org/2000/svg", "path")).attr("d", pathD));

    return $('<button type="button" class="gh-chat-scroll-arrow">')
      .attr("aria-label", label)
      .append($svg)
      .on("click", onClick);
  }

  // Renders the row into $container (emptied first) and wires scroll/resize-driven arrow
  // visibility. onSelect(text) fires when a chip is tapped.
  function renderQuickReplies($container, replies, onSelect) {
    $container.empty().addClass("gh-chat-quick-replies");

    var $scroller = $('<div class="gh-chat-quick-replies-scroll">');
    replies.forEach(function (reply) {
      $('<button type="button" class="gh-chat-chip">')
        .text(reply)
        .on("click", function () {
          onSelect(reply);
        })
        .appendTo($scroller);
    });

    var $leftArrow = arrowButton("left", function () {
      scrollByPage(-1);
    }).hide();
    var $rightArrow = arrowButton("right", function () {
      scrollByPage(1);
    }).hide();

    function scrollByPage(direction) {
      var el = $scroller[0];
      var target = el.scrollLeft + direction * el.clientWidth * 0.8;
      if (typeof el.scrollTo === "function") {
        el.scrollTo({ left: target, behavior: "smooth" });
      } else {
        el.scrollLeft = target;
      }
    }

    function measure() {
      var el = $scroller[0];
      // A few px of slack so rounding doesn't leave an arrow stuck on at the very end.
      $leftArrow.toggle(el.scrollLeft > 4);
      $rightArrow.toggle(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    $scroller.on("scroll", measure);
    if (typeof ResizeObserver !== "undefined") {
      var observer = new ResizeObserver(measure);
      observer.observe($scroller[0]);
    }

    $container.append($leftArrow).append($scroller).append($rightArrow);
    // Initial measurement after layout has actually happened.
    window.setTimeout(measure, 0);
  }

  GHChat.renderQuickReplies = renderQuickReplies;
  GHChat.FALLBACK_QUICK_REPLIES_BY_LANGUAGE = FALLBACK_QUICK_REPLIES_BY_LANGUAGE;
})(window.GHChat, jQuery);
