---
"atollic": patch
---

Preserve hydrated island state across server HMR. Editing a server file no longer resets the state of mounted islands: the morph now skips island subtrees (via `beforeNodeMorphed`) and island ids stay stable across the HMR refetch thanks to a per-request id counter backed by `AsyncLocalStorage`.
