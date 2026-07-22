// Step 22: verifies src/features/chat-widget/logic/render-markdown.tsx against synthetic
// malicious input, not just happy-path formatting -- this renders live model output (which
// flows partly from a RAG corpus) into the DOM, so the safety property matters more than the
// formatting itself. Renders to a static HTML string via react-dom/server so the assertions can
// just be string checks; no live browser or dev server needed. Run with `npm run test:markdown`.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMarkdown } from "@/features/chat-widget/logic/render-markdown";

function render(content: string): string {
  return renderToStaticMarkup(createElement("div", null, renderMarkdown(content)));
}

interface Case {
  id: string;
  input: string;
  check: (html: string) => { pass: boolean; detail: string };
}

const CASES: Case[] = [
  {
    id: "1. javascript: link is neutralized",
    input: "[click me](javascript:alert(1))",
    check: (html) => {
      const pass = !html.includes("<a") && html.includes("click me");
      return { pass, detail: `Should not render a live <a> for a javascript: href. Got: ${html}` };
    },
  },
  {
    id: "2. data: link is neutralized",
    input: "[open](data:text/html,<script>alert(1)</script>)",
    check: (html) => {
      const pass = !html.includes("<a");
      return { pass, detail: `Should not render a live <a> for a data: href. Got: ${html}` };
    },
  },
  {
    id: "3. https: link renders as a real, safe anchor",
    input: "[apply here](https://guidancehomeservices.com/apply)",
    check: (html) => {
      const pass =
        html.includes('href="https://guidancehomeservices.com/apply"') &&
        html.includes('rel="noopener noreferrer"') &&
        html.includes('target="_blank"');
      return { pass, detail: `Should render a real anchor with noopener/noreferrer. Got: ${html}` };
    },
  },
  {
    id: "4. raw HTML in message content is escaped, not executed",
    input: '<img src=x onerror=alert(1)> and <script>alert(1)</script>',
    check: (html) => {
      const pass = !html.includes("<img") && !html.includes("<script>") && html.includes("&lt;img");
      return { pass, detail: `Raw-looking HTML should render as escaped text, never as a live element. Got: ${html}` };
    },
  },
  {
    id: "5. bold renders as <strong>, not raw asterisks",
    input: "This is **important** information.",
    check: (html) => {
      const pass = html.includes("<strong>important</strong>");
      return { pass, detail: `Expected <strong>important</strong>. Got: ${html}` };
    },
  },
  {
    id: "6. bullet list renders as <ul><li>",
    input: "- first point\n- second point",
    check: (html) => {
      const pass = html.includes("<ul") && html.split("<li").length - 1 === 2;
      return { pass, detail: `Expected a <ul> with 2 <li> items. Got: ${html}` };
    },
  },
  {
    id: "7. no dangerouslySetInnerHTML escape hatch is reachable via content alone",
    input: "<div dangerouslySetInnerHTML>", // proves this literal string can't inject a real attribute/element
    check: (html) => {
      const pass = !html.includes("<div dangerouslySetInnerHTML>") && html.includes("&lt;div");
      return { pass, detail: `Should render as escaped text. Got: ${html}` };
    },
  },
];

function main() {
  let passed = 0;
  let failed = 0;

  for (const testCase of CASES) {
    console.log(testCase.id);
    try {
      const html = render(testCase.input);
      const result = testCase.check(html);
      if (result.pass) {
        console.log(`  PASS  ${result.detail}`);
        passed++;
      } else {
        console.log(`  FAIL  ${result.detail}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ERROR  ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
