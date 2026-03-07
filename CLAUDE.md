# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Install deps + prisma generate + prisma migrate dev (first-time setup)
npm run dev          # Start dev server (Turbopack, defaults to :3000)
npm run build        # Production build
npm run test         # Run all tests (vitest)
npx vitest run src/path/to/file.test.ts  # Run a single test file
npm run db:reset     # Reset database (destructive)
```

## Architecture

UIGen is an AI-powered React component generator. Users describe a component in chat, and Claude generates JSX files in a virtual file system, which are then transpiled and previewed in-browser.

### Request flow

1. User sends a message via `ChatInterface` → `useChat` (Vercel AI SDK) streams to `POST /api/chat`
2. The API route reconstructs a `VirtualFileSystem` from the serialized `files` payload, then calls `streamText` with two tools: `str_replace_editor` (create/edit files) and `file_manager` (delete/rename)
3. As the model calls tools, the VFS is mutated in-memory on the server
4. On finish, the full message history and serialized VFS are persisted to the `Project` row in SQLite (authenticated users only)
5. The client receives tool-call results and updates its own VFS state via `FileSystemContext`
6. `PreviewFrame` transpiles the VFS files using `@babel/standalone` at runtime and renders them in an iframe

### Key abstractions

`VirtualFileSystem` (`src/lib/file-system.ts`) — in-memory tree of `FileNode` objects. Serializes to/from plain `Record<string, FileNode>` for JSON transport and DB storage. A singleton `fileSystem` export is available but the API route always reconstructs from the client payload.

`FileSystemContext` / `ChatContext` (`src/lib/contexts/`) — React contexts that bridge VFS state and AI chat state to the UI. `MainContent` wraps everything in these two providers.

`getLanguageModel()` (`src/lib/provider.ts`) — returns `anthropic("claude-haiku-4-5")` when `ANTHROPIC_API_KEY` is set, otherwise falls back to `MockLanguageModel` which generates static counter/form/card components without calling the API. The mock limits to 4 `maxSteps` vs 40 for real.

### Auth

JWT-based sessions via `jose`, stored in an `httpOnly` cookie (`auth-token`). `JWT_SECRET` env var defaults to `"development-secret-key"`. `src/middleware.ts` protects `/[projectId]` routes. Anonymous users can use the app but projects are not persisted.

### Database

Prisma + SQLite (`prisma/dev.db`). Two models: `User` and `Project`. Chat messages (`messages`) and VFS state (`data`) are stored as JSON strings on the `Project` model. Prisma client is generated to `src/generated/prisma/`.

The data schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

## Code style

Use comments sparingly. Only comment complex or non-obvious code.

### Tech stack

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Vercel AI SDK (`ai` + `@ai-sdk/anthropic`), Prisma, Monaco Editor, Radix UI primitives.
