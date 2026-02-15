---
title: "React Compiler in 2026: If You Write useMemo, You're Doing It Wrong"
date: "2026-02-21"
excerpt: "The days of dependency array hell are over. React Compiler (formerly React Forget) is now the default. Learn why manual memoization is an anti-pattern and how to clean up your legacy codebase."
coverImage: "/images/posts/react_compiler.svg"
category: "React"
---

## The Dependency Array Nightmare

Remember 2024?
You write a simple customized hook.
Then ESLint yells at you: `React Hook useEffect has a missing dependency: 'fetchData'.`
So you wrap `fetchData` in `useCallback`.
Then ESLint yells: `React Hook useCallback has a missing dependency: 'userId'.`
So you add `userId`.
Suddenly, your 10-line component has 40 lines of memoization boilerplate.

## Enter React Compiler (2026)

React Compiler (code-named "React Forget") handles this automatically at build time.
It deeply analyzes your JavaScript/TypeScript code and determines:
1.  What values can change?
2.  What values are constant?
3.  Which components need to re-render?

It then injects the memoization logic *for you*.

### The "Before" (Manual Memoization)

```tsx
function ProductList({ products, filter }) {
  // Expensive calculation
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === filter);
  }, [products, filter]); // Manual dependency tracking

  // Callback stability
  const handleClick = useCallback((id) => {
    console.log("Clicked", id);
  }, []); // Hope you didn't forget anything!

  return <List items={filteredProducts} onClick={handleClick} />;
}
```

### The "After" (Compiler Optimized)

```tsx
function ProductList({ products, filter }) {
  // Just write JavaScript.
  const filteredProducts = products.filter(p => p.category === filter);

  const handleClick = (id) => {
    console.log("Clicked", id);
  };

  return <List items={filteredProducts} onClick={handleClick} />;
}
```

Wait, won't this be slow?
No. The Compiler sees that `products.filter` depends on `products` and `filter`.
It generates code that caches the result of `filteredProducts` and only re-runs it if `products` or `filter` changes.
It sees that `handleClick` doesn't depend on anything, so it makes it a stable reference.

## Deleting `useMemo` is the New Refactoring

In 2026, seeing `useMemo` in a PR is a code smell.
It means either:
1.  The developer doesn't trust the compiler.
2.  They are doing something so complex that the compiler bailed out (rare).

## Performance Impact

The biggest win isn't code size (though that helps).
It's **Granular Updates**.
Components don't just "re-render".
The compiler can target specific DOM nodes.
If `state.count` changes, only the text node displaying the count updates. The `<HeavyChart />` next to it doesn't even get touched.

## Conclusion

React has finally fulfilled its promise: **"It's just JavaScript."**
We spent 5 years learning the quirks of the rendering engine.
Now, we can forget them.
Delete your dependency arrays. Trust the compiler.
