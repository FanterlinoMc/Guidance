// Positional, not heading-text-derived — headings repeat both within a page (duplicate reviewer
// names, responsive-layout dupes) and across entities that share a URL path (every site has its
// own /privacy-and-security), so a positional id is the only one guaranteed unique.
export function buildChunkId(
  entity: string,
  pathname: string,
  sectionIndex: number,
  chunkIndex: number,
): string {
  return `${entity}-${pathname}-${sectionIndex}-${chunkIndex}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
