# AI Writing Assistant

A minimal writing editor with AI-powered text continuation.

## Tech Stack
- React + TypeScript
- XState v5
- ProseMirror
- Next.js (API route)
- Tailwind CSS

## What It Does
- Continue writing from the cursor position
- Rewrite or expand selected text
- Style-based generation (auto / professional / creative / casual)

## How “Continue Writing” Works
- **Selection present** → AI rewrites or expands the selected text
- **Cursor only** → AI continues from the cursor using preceding context (up to 2000 characters)
- Generated text is inserted at the cursor position captured at click time

## Architecture
- XState coordinates editor lifecycle, context extraction, async generation, and insertion
- ProseMirror editor is initialized once and stored in a ref to avoid React re-renders
- AI generation is handled via an XState `fromPromise` actor

## Running Locally
```bash
npm install
npm run dev
