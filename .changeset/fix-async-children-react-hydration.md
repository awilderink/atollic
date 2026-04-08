---
"atollic": patch
---

Fix async children and React children hydration inside islands. Server-rendered children passed into an island now resolve correctly when they are async (promises/JSX returning a promise) and survive hydration on React islands without being reconciled away.
