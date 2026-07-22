// Explicit React import (unlike the rest of this codebase, which relies on the automatic JSX
// runtime under Next's SWC build) so tests/evals/render-markdown.eval.ts can also run this file
// directly through tsx/esbuild, which falls back to the classic transform for tsconfig's
// `jsx: "preserve"` and needs React in scope. Harmless under Next's own build either way.
import React, { type ReactNode } from "react";

// Step 22: renders exactly the markdown subset src/features/system-prompt promises the model
// ("short paragraphs, occasional bullet list", plus links as a closing next-action) -- bold,
// links, and bullet lists. Deliberately hand-rolled instead of pulling in a markdown library:
// this is a narrow, fully-controlled grammar, and building React elements directly (never
// dangerouslySetInnerHTML) means there's no HTML-parsing surface for model output -- which
// flows partly from a RAG corpus -- to exploit. Link hrefs are scheme-allowlisted below for the
// same reason: a rendered `[x](javascript:...)` would otherwise be a live injection vector.
const SAFE_LINK_SCHEMES = new Set(["http:", "https:"]);

function isSafeHref(href: string): boolean {
  try {
    return SAFE_LINK_SCHEMES.has(new URL(href).protocol);
  } catch {
    // Relative/unparseable hrefs aren't a case the system prompt promises, so fail closed
    // (render as plain text) rather than guess at a base URL to resolve against.
    return false;
  }
}

const INLINE_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let matchIndex = 0;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [full, boldText, linkText, linkHref] = match;
    if (boldText !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${matchIndex}`}>{boldText}</strong>);
    } else if (linkText !== undefined && linkHref !== undefined && isSafeHref(linkHref)) {
      nodes.push(
        <a
          key={`${keyPrefix}-a-${matchIndex}`}
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {linkText}
        </a>,
      );
    } else {
      // Either an unsafe-scheme link or a pattern we don't otherwise handle -- keep the
      // original text visible rather than silently dropping it.
      nodes.push(full);
    }

    lastIndex = INLINE_PATTERN.lastIndex;
    matchIndex++;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function renderBlock(block: string, blockIndex: number): ReactNode {
  const lines = block.split("\n").filter((line) => line.length > 0);
  const isBulletList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line));

  if (isBulletList) {
    return (
      <ul key={`block-${blockIndex}`} className="list-disc space-y-0.5 pl-5">
        {lines.map((line, lineIndex) => (
          <li key={`block-${blockIndex}-item-${lineIndex}`}>
            {renderInline(line.replace(/^[-*]\s+/, ""), `b${blockIndex}-l${lineIndex}`)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={`block-${blockIndex}`}>
      {lines.map((line, lineIndex) => (
        <span key={`block-${blockIndex}-line-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {renderInline(line, `b${blockIndex}-l${lineIndex}`)}
        </span>
      ))}
    </p>
  );
}

export function renderMarkdown(content: string): ReactNode {
  return content.split(/\n{2,}/).map((block, blockIndex) => renderBlock(block, blockIndex));
}
