# Markdown To Notion

## Project Overview
A Next.js application that converts Markdown text into Notion pages. Users can input markdown, provide their Notion API key, select a target page, and the app will append the converted content as Notion blocks.

## Tech Stack
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4.1.9
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics

## Project Structure

```
markdown-to-notion/
├── app/
│   ├── api/
│   │   ├── convert/route.ts      # POST endpoint to convert markdown and append to Notion
│   │   └── pages/route.ts        # POST endpoint to fetch user's Notion pages
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main page component
├── components/
│   ├── markdown-converter.tsx    # Main converter UI component
│   ├── page-selector.tsx         # Dropdown to select Notion pages
│   ├── theme-provider.tsx        # Theme context provider
│   └── ui/                       # shadcn/ui component library (60+ components)
├── lib/
│   ├── markdown-to-blocks.ts     # Core markdown parser and Notion block converter
│   └── utils.ts                  # Utility functions (cn helper)
├── hooks/
│   ├── use-mobile.ts             # Mobile detection hook
│   └── use-toast.ts              # Toast notification hook
└── styles/                       # Global CSS and Tailwind config
```

## Core Functionality

### 1. Markdown Parsing (`lib/markdown-to-blocks.ts`)
The main conversion logic that transforms markdown syntax into Notion block objects:

**Supported Markdown Elements:**
- Headings: `#`, `##`, `###` (h1, h2, h3)
- Lists: Bulleted (`-`, `*`, `+`) and Numbered (`1.`, `2.`)
- Code blocks: ` ```language ` with syntax highlighting
- Inline formatting: `**bold**`, `*italic*`, `` `code` ``
- Quotes: `> text`
- Dividers: `---`
- Paragraphs: Regular text

**Key Functions:**
- `markdownToBlocks(markdown: string)`: Main parser that splits markdown into lines and converts to Notion blocks
- `parseRichText(text: string)`: Handles inline formatting (bold, italic, code)
- `createHeading()`, `createParagraph()`, `createBulletedListItem()`, etc.: Block factory functions

### 2. API Routes

#### `/api/pages` (`app/api/pages/route.ts`)
- Fetches all accessible Notion pages for the user
- Uses Notion Search API with filter for pages only
- Returns sorted list (by last_edited_time, descending)
- Extracts page titles from properties (handles both "title" and "Name" properties)

#### `/api/convert` (`app/api/convert/route.ts`)
- Receives: markdown text, API key, target page ID
- Converts markdown to Notion blocks using `markdownToBlocks()`
- Appends blocks to the selected page using Notion API `PATCH /blocks/{pageId}/children`
- Returns success/error response

### 3. UI Components

#### `MarkdownConverter` (`components/markdown-converter.tsx`)
Main component with three sections:
1. **Markdown Input**: Textarea for entering markdown
2. **Notion API Key**: Password input (stored locally, never saved)
3. **Page Selector**: Dropdown to choose target page
4. **Convert Button**: Triggers conversion with loading state
5. **Status Alerts**: Success/error feedback

#### `PageSelector` (`components/page-selector.tsx`)
- Combobox component using Radix UI Popover + Command
- Fetches pages when opened (lazy loading)
- Searchable dropdown with keyboard navigation
- Disabled until API key is provided

## Configuration Files

### `next.config.mjs`
- ESLint and TypeScript errors ignored during builds (for rapid development)
- Unoptimized images enabled

### `tsconfig.json`
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Target: ES6

### `components.json` (shadcn/ui config)
- Style: "new-york"
- Base color: neutral
- CSS variables enabled
- Icon library: Lucide

## Environment & Dependencies

### Key Dependencies
- `next`: 15.2.4
- `react`: 19
- `@radix-ui/*`: 60+ UI primitive components
- `lucide-react`: Icon library
- `tailwindcss`: 4.1.9
- `zod`: 3.25.76 (validation, though not currently used extensively)
- `react-hook-form` + `@hookform/resolvers`: Form management (available but not actively used)

### Package Manager
Based on `pnpm-lock.yaml` presence, this project uses **pnpm**.

## API Integration

### Notion API Details
- **API Version**: `2022-06-28`
- **Authentication**: Bearer token (user's integration token)
- **Endpoints Used**:
  - `POST https://api.notion.com/v1/search` - List pages
  - `PATCH https://api.notion.com/v1/blocks/{page_id}/children` - Append blocks

### Security Notes
- API keys are handled client-side and passed to API routes
- No API keys are stored server-side or in databases
- All Notion API calls are proxied through Next.js API routes

## Development Workflow

### Commands
```bash
pnpm install  # Install dependencies
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Git Status
- Currently on `main` branch
- Multiple untracked files (new project setup)

## Known Limitations & Potential Improvements

### Current Limitations
1. **Markdown Support**: Limited to basic markdown (no tables, task lists, images, links)
2. **Rich Text Parsing**: Simple character-by-character parser (may fail with nested formatting)
3. **Error Handling**: Basic error messages, no retry logic
4. **No Persistence**: API keys entered each session
5. **No Preview**: Can't preview Notion blocks before conversion
6. **Block Limit**: Notion API has a 100-block limit per request (not enforced)

### Suggested Enhancements
1. Add support for:
   - Markdown links `[text](url)` → Notion link annotations
   - Images `![alt](url)` → Notion image blocks
   - Tables → Notion table blocks
   - Task lists `- [ ]` → Notion to-do blocks
   - Strikethrough `~~text~~`
2. Improve rich text parser (use regex or proper tokenizer)
3. Add localStorage for API key persistence (with encryption)
4. Implement preview mode showing Notion block structure
5. Handle nested lists properly
6. Add batch processing for large markdown files (split into 100-block chunks)
7. Support creating new pages (currently only appends to existing)
8. Add undo/history functionality
9. Better error messages (e.g., invalid API key, permission errors)
10. Add dark mode toggle
11. Support importing markdown files via file upload
12. Export feature (Notion → Markdown)

## Important Files for Development

### Must Understand
- `lib/markdown-to-blocks.ts`: Core conversion logic
- `app/api/convert/route.ts`: Main API endpoint
- `components/markdown-converter.tsx`: Primary UI

### Frequently Modified
- `lib/markdown-to-blocks.ts`: When adding new markdown syntax support
- UI components: When improving user experience

### Rarely Modified
- `components/ui/*`: shadcn/ui library (stable)
- Config files: Only for infrastructure changes

## Testing Considerations
- No test files present yet
- Consider adding:
  - Unit tests for `markdownToBlocks()` with various markdown inputs
  - Integration tests for API routes
  - E2E tests for full conversion flow

## Notion API Resources
- [Notion API Documentation](https://developers.notion.com/)
- [Block Object Reference](https://developers.notion.com/reference/block)
- [Rich Text Specification](https://developers.notion.com/reference/rich-text)
