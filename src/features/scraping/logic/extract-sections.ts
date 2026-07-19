import type { CheerioAPI } from "cheerio";
import type { AnyNode, Element, Text } from "domhandler";
import type { PageSection } from "./types";

// guidanceresidential.com repeats these global widgets on every page (verified via raw HTML
// inspection): a stale webinar promo, a duplicate "schedule a consultation" CTA modal with no
// unique text, and an empty YouTube-embed modal. #contactUsModal is kept — it holds real support
// phone numbers/hours, worth having even if duplicated across pages.
const STRIP_SELECTORS = [
  "script",
  "style",
  "noscript",
  "nav",
  "header",
  "footer",
  "svg",
  "form",
  "#webinarModal",
  "#scheduleConsultationModal",
  "#ytModal",
];

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4"]);

// Page-builder sites (Elementor/HubSpot/etc.) often wrap body text in bare <div>/<span> rather
// than <p>/<li>, so this walks every node in document order and grabs text nodes directly instead
// of relying on specific tags. Also intentionally does NOT strip [aria-hidden] — bio/detail
// content in Bootstrap modals defaults to aria-hidden until clicked open, but a chatbot doesn't
// care about that visual/interactive state, only the text.
function extractSections($: CheerioAPI): PageSection[] {
  const sections: PageSection[] = [];
  const seenText = new Set<string>();
  let currentHeading = "General";
  let currentText: string[] = [];

  const flush = () => {
    const text = currentText.join(" ").replace(/\s+/g, " ").trim();
    currentText = [];
    if (!text || seenText.has(text)) return;
    // Responsive layouts render the same content twice (one breakpoint hidden by CSS), and both
    // copies land in the raw HTML — drop exact repeats within a page.
    seenText.add(text);
    sections.push({ heading: currentHeading, text });
  };

  function walk(node: AnyNode) {
    if (node.type === "text") {
      const text = (node as Text).data.replace(/\s+/g, " ").trim();
      if (text) currentText.push(text);
      return;
    }
    if (node.type !== "tag") return;

    const tag = (node as Element).tagName?.toLowerCase();
    if (HEADING_TAGS.has(tag)) {
      const heading = $(node).text().replace(/\s+/g, " ").trim();
      if (heading) {
        flush();
        currentHeading = heading;
      }
      return;
    }

    $(node)
      .contents()
      .each((_, child) => walk(child));
  }

  const body = $("body").get(0);
  if (body) walk(body);
  flush();

  return sections;
}

export function extractPage($: CheerioAPI): { title: string; sections: PageSection[] } {
  const title = $("title").first().text().trim();
  STRIP_SELECTORS.forEach((selector) => $(selector).remove());
  return { title, sections: extractSections($) };
}
