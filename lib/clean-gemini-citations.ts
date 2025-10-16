/**
 * Removes Gemini citation markers from markdown text
 *
 * Patterns removed:
 * - [cite_start]
 * - [cite: 123] or [cite: 123, 456, 789]
 *
 * @param markdown - The markdown text containing Gemini citations
 * @returns Cleaned markdown text without citation markers
 */
export function cleanGeminiCitations(markdown: string): string {
  if (!markdown) return markdown

  let cleaned = markdown

  // Remove [cite_start] markers
  cleaned = cleaned.replace(/\[cite_start\]/gi, '')

  // // Remove [cite: numbers] patterns (e.g., [cite: 441], [cite: 441, 444])
  cleaned = cleaned.replace(/\[cite:\s*\d+(?:,\s*\d+)*\]/gi, '')

  // // Ensure block equations ($$...$$) have newlines after opening and before closing $$
  // // This handles cases like: $$equation$$ -> $$\nequation\n$$
  // cleaned = cleaned.replace(/\$\$/g, '\n$$$$\n');
  // cleaned = cleaned.replace(/\$\$(?!\n)/g, '$$\n')  // Add newline after opening $$ if not present
  // cleaned = cleaned.replace(/(?<!\n)\$\$/g, '\n$$')  // Add newline before closing $$ if not present

  // // Clean up spaces before punctuation
  // cleaned = cleaned.replace(/\s+([.,!?;:])/g, '$1')

  // // Clean up spaces at the start of lines
  // cleaned = cleaned.replace(/^\s+/gm, '')

  return cleaned
}
