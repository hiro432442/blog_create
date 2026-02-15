---
title: "Partial Prerendering (PPR) is Finally Stable: Adoption Guide"
date: "2026-02-20"
excerpt: "Stop choosing between Static and Dynamic. Learn how to adopt Partial Prerendering (PPR) to serve an instant static shell from the edge while streaming personalized dynamic content in the same request."
coverImage: "/images/posts/nextjs_ppr.svg"
category: "Performance"
---

## The Eternal Trade-off

For the last 10 years of React development, we had to choose:

*   **Static (SSG/ISR)**: Insanely fast (served from CDN), but the data is stale. Used for blogs, marketing pages.
*   **Dynamic (SSR)**: Fresh data, but slow Time-To-First-Byte (TTFB) because the server has to fetch data before sending HTML. Used for dashboards, e-commerce.

We tried to mix them with "Client Side Fetching" (SWR/React Query), but that led to layout shifts and spinners.

## Enter PPR (Partial Prerendering)

In 2026, **PPR** is the default rendering mode for Next.js applications deployed to Vercel or compliant hosts.
It gives you the best of both worlds:

1.  **Instant Static Shell**: The browser receives the Header, Footer, and Sidebar immediately (0ms wait, served from Edge Cache).
2.  **Streaming Dynamic Holes**: The "User Profile" or "Recommended Products" stream in parallel as they finish fetching.

This isn't just "Streaming SSR".
In traditional Streaming SSR, the *entire* request is dynamic. The server has to start up.
In PPR, the *shell is pre-built at build time*.

## How to Adopt PPR

It's surprisingly easy. The boundary is defined by `<Suspense>`.

### 1. Enable it

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: true, // Likely stable by now
  },
};
```

### 2. Define your Static Shell

Simply wrap dynamic parts in Suspense. **Everything outside is automatically Static.**

```tsx
export default function Page() {
  // This part is STATIC (Pre-rendered at build time)
  return (
    <main>
      <h1>Welcome to the Store</h1>
      <StaticSidebar />
      
      {/* This part is DYNAMIC (Streams in on request) */}
      <Suspense fallback={<ProductSkeleton />}>
        <RecommendedProducts />
      </Suspense>
    </main>
  );
}
```

Wait, that's it?
Yes. Next.js analyzes your component tree.
It sees that `RecommendedProducts` uses `cookies()` or `headers()`, so it marks it as dynamic.
It sees that `StaticSidebar` typically renders the same HTML, so it bakes it into the static shell.

## The Gotchas

### Deopting the Shell
If you access `cookies()` inside the root layout *without* wrapping it in Suspense, the **entire page** becomes dynamic.
This destroys the benefit of PPR.

**Wrong:**
```tsx
// layout.tsx
export default function Layout({ children }) {
  const theme = cookies().get('theme'); // ❌ Whole app is now Dynamic
  return <div className={theme}>{children}</div>;
}
```

**Right:**
```tsx
// layout.tsx
export default function Layout({ children }) {
  return (
    <div>
      <Suspense fallback={null}> 
         <ThemeLoader /> {/* ✅ Only this part is dynamic */}
      </Suspense>
      {children}
    </div>
  );
}
```

## Conclusion

PPR is arguably the biggest shift in web rendering since the invention of SSR.
It removes the "Static vs Dynamic" binary.
Your website is now a spectrum. Make the shell static, make the content dynamic, and give your users the fastest experience possible.
