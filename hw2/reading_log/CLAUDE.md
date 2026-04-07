# Reading Log

A personal reading journal built with Next.js, Tailwind CSS, and React Context. Track books you're reading, have finished, or want to read — with notes, quotes, ratings, and a reading timeline.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **React Context + useReducer** for client-side state (data lives in memory)
- **nanoid** for unique book IDs
- **Google Fonts**: Playfair Display (headings) + Lora (body)
- **Playwright MCP** for browser-based verification

## Running the App

```bash
npm run dev
```

Visit http://localhost:3000

## Pages

| Route | Description |
|---|---|
| `/` | **Home / Dashboard** — Stats (books read, reading, want-to-read, avg rating), currently reading section, recently added strip, CTA to add a book |
| `/shelf` | **Shelf** — Filterable card grid of all books, filter by status (All / Reading / Finished / Want to Read) |
| `/add` | **Add Book** — Form with title, author, genre, status, 1–10 rating slider, favourite quotes textarea, personal thoughts textarea, start/finish dates |
| `/book/[id]` | **Book Detail** — Dynamic route. Full book info + reading timeline (added → started → finished), quotes, thoughts, delete action |

## Data Model

```typescript
interface Book {
  id: string;           // nanoid
  title: string;
  author: string;
  genre?: string;
  status: 'reading' | 'finished' | 'want-to-read';
  rating?: number;      // 1–10
  quotes?: string;      // favourite quotes
  thoughts?: string;    // personal thoughts
  dateAdded: string;    // ISO date string (YYYY-MM-DD)
  dateStarted?: string;
  dateFinished?: string;
}
```

## State Management

`BookContext` (`context/BookContext.tsx`) uses `useReducer` with three actions:
- `ADD_BOOK` — prepends a new book
- `UPDATE_BOOK` — replaces a book by id
- `DELETE_BOOK` — removes a book by id

The context is initialized with 6 seed books so the app looks populated immediately.

## Style

- **Background**: `bg-amber-50` (warm cream)
- **Accent**: `indigo-700` (dusty indigo)
- **Cards**: white with `border-stone-200`, `rounded-2xl`, `shadow-sm`
- **Status badges**: emerald (reading), indigo (finished), amber (want-to-read)
- **Fonts**: Playfair Display for headings, Lora for body text

## Playwright MCP

`.mcp.json` at the project root configures the Playwright MCP server:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**Verification workflow**: Navigate to `/add`, fill in the form, submit, confirm redirect to `/shelf` and that the new book appears in the grid.
