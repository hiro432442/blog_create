---
title: "Why I Deleted My API Folder: Server Actions as the New Standard"
date: "2026-02-20"
excerpt: "In 2026, writing manual API routes for internal mutations is considered legacy. Learn how to replace your `app/api` folder with Server Actions for end-to-end type safety and zero boilerplate."
coverImage: "/images/posts/nextjs_server_actions.svg"
category: "Next.js"
---

## The "API" Anti-Pattern

For years, we built Next.js apps like this:
1.  Create a form on the client.
2.  `JSON.stringify()` the data.
3.  `fetch('/api/todos')`.
4.  Create `app/api/todos/route.ts`.
5.  Parse the JSON again.
6.  Validate it.
7.  Save to DB.

Why?
Why are we treating our own frontend like a stranger?
We control both ends of the wire. We shouldn't need a REST API to talk to ourselves.

## Enter Server Actions (RPC)

In 2026, Server Actions are the default way to handle mutations.
They are effectively **Remote Procedure Calls (RPC)** that look like local functions.

### The Code Transformation

**Before (Legacy 2023 Style):**

```typescript
// app/api/create/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  await db.create(body); // Hope 'body' is correct!
  return NextResponse.json({ success: true });
}
```

**After (2026 Style):**

```typescript
// app/actions.ts
'use server'

export async function createTodo(formData: FormData) {
  const title = formData.get('title');
  await db.todos.create({ title });
  revalidatePath('/'); // Immediate UI update
}
```

## Type Safety Without TRPC

The biggest win is type safety.
You don't need a heavy library like TRPC anymore.
Since the Server Action is just a standard TypeScript function, your client component *knows* the argument types.

If you change the arguments in `actions.ts`, your `submit` button turns red in VS Code.
**Zero network boundary boilerplate.**

## Security Myths

"But isn't it insecure to expose DB logic to the client?"
No.
A Server Action **IS** a POST endpoint.
Next.js compiles `createTodo` into a unique URL hash. When you click the button, it sends a POST request to that hash.

You still need validation (Zod) and Authentication (Auth.js), just like an API route.

```typescript
export async function secureAction(data: z.infer<typeof schema>) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  // Safe to proceed
}
```

## When to Keep `/api`?

The `/api` folder isn't dead, but its purpose has changed.
Use it for **External Integration**:
*   Webhooks (Stripe, Slack).
*   Mobile App Backends.
*   Public APIs for 3rd party developers.

But for your own React frontend? Delete the folder.
Embrace the RPC pattern. Your codebase will shrink by 40%.
