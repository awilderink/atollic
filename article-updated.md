# We built a big app on htmx. Then we needed islands.

## Why we picked htmx

Before I get into what broke, it is worth saying why we picked htmx in the first place, because I still think the choice was right.

Our app is a domain-driven monolith. Submissions, policies, parties, parameters. Each aggregate has routes that render representations of itself, and when the user acts on a thing, the server decides what the thing should look like next. The client does not need to know the state machine of a submission. The server just tells it. That is HATEOAS, and it is not a gimmick: it is the natural fit for a DDD app where the server _is_ the source of truth. Moving that state machine into a client store would have meant duplicating a model we already had and paying a "keep the client model in sync with the server model" tax on every feature, forever.

htmx also gave us end-to-end type safety for free. Our server renders typed JSX against our domain models, and the browser consumes whatever comes back. There is no API contract, no OpenAPI generator, no client SDK. The contract _is_ the HTML. Rename a field on a domain object and the type error is in the template, not six layers away in a generated client.

For 90% of the app, this is still the right architecture. Routes render HTML, forms post to routes, htmx swaps the relevant fragments. No client state, no client routing, no client data layer. Just the domain, the server, and the DOM.

## The wizard that broke me

We have a spreadsheet-import wizard. The user uploads a file, picks a sheet and header row, then maps each column to a field in our domain schema before a background job parses the rows. Three steps, one progress bar, one submit button. From the user's perspective, it is one feature.

I sat down to add a "Save mapping as template" button to it last quarter and stopped to count how many places the wizard already lived. Here it is:

| Endpoint | Target | Swap |
| --- | --- | --- |
| `POST /import/step-1` | `#upload-form` | `outerHTML` |
| `POST /import/step-2` | `#progress` | `outerHTML` |
| `POST /import/step-3` | `#progress` | `outerHTML` |
| `GET /import/back` | `#step-content` | `innerHTML` |
| `GET /import/retry` | `#step-content` | `innerHTML` |
| `POST /import/template-confirm` | n/a | `none` |
| `GET /import/progress` | `#progress` | `morph` (every 500ms) |
| `GET /import/cancel` | n/a | `none` |

Eight endpoints. Three swap targets. One in-memory `Map<string, UploadJob>` shared between the background parser and the polling endpoint. And to add my button: find the route handler that should produce the new state. Then find the markup that owns the target id, in some other file you might or might not remember the name of. Then make sure your new fragment HTML matches the wrapper id of the existing target. Then test all four entry points that could land the user in the new state, because nothing in the codebase enumerates them.

Want to rename `#step-content`? Grep across eight files and hope you caught them all.

## The swap graph

The wizard is an extreme case, but the underlying pattern is everywhere in any non-trivial htmx app.

A single form post in a complex layout often needs to update more than one region: the main panel, a sidebar summary, a toolbar button, a toast. In htmx that means the route handler has to return every affected fragment, threaded through `hx-swap-oob`, and the caller has to name each target by DOM id. One action's "response shape" is now a distributed graph of IDs that live in other files.

Rename the id, break the swap. Move the markup that owns the id, break the swap. Add a new place that needs to react to the same action, go edit the route handler that returned it. Nothing connects these except strings, and nothing compiles.

In a small app this is fine. The graph is small enough to hold in your head. In a complex layout it becomes _the_ source of brittleness. You trace "what happens when the user clicks Upload" by grepping across four files, and you find the broken cases in production.

That is one of the two locality problems an htmx-at-scale codebase hands you: the _feature locality_ problem. The unit you actually want to reason about ("the upload wizard," "the orders panel") does not exist as a thing in the code. It is implicit in a graph of IDs and route handlers, and the only tool you have for navigating it is grep.

The other locality problem shows up the moment you try to build a stateful interaction inside one of those fragments.

## The Alpine ceiling

For client-side state in an htmx app, the standard answer is Alpine. And it is genuinely great for the small stuff: class toggles, open/close, hover states, a confirm dialog. The ceiling is what happens when the interaction needs to do more than that.

Take the simplest possible "pick some things and submit them" UI. A list of tasks with hours, click to include each one, a running total, a submit button. The "right" Alpine pattern at this size is `Alpine.data("id", () => ({...}))` in its own file. So:

```typescript
// alpine/data/picker.ts
window.Alpine.data('picker', () => ({
  selected: {} as Record<string, number>,

  get total() {
    return Object.values(this.selected).reduce((a, b) => a + b, 0);
  },

  toggle(id: string) {
    if (id in this.selected) {
      delete this.selected[id];
      return;
    }
    const row = document.querySelector(`[data-id="${id}"]`);
    this.selected[id] = Number(row?.getAttribute('data-hours') ?? 0);
  },
}));
```

And the markup, in a file hundreds of lines away:

```html
<div x-data="picker">
  {tasks.map((task) => (
    <label data-id={task.id} data-hours={task.hours}>
      <input type="checkbox" x-on:change={`toggle('${task.id}')`} />
      {task.name} ({task.hours}h)
    </label>
  ))}

  <p>Total: <span x-text="total"></span>h</p>

  <button
    hx-post="/invoice"
    x-bind:hx-vals="JSON.stringify({task_ids: Object.keys(selected)})"
  >
    Create invoice
  </button>
</div>
```

Look at the seams.

The server already has the task data (id, hours, name) at render time. To get the hours into the picker's running total, we serialize it back into a `data-hours` attribute on each row, then `getAttribute` it out and `Number()` it the moment it is touched. The selection state is `Record<string, number>` because the value just made a round trip through a string DOM attribute. No type system has any opinion on whether `data-hours` exists, what shape it is, or whether `task.hours` upstream is even still called that.

When the user clicks "Create invoice," Alpine has to hand its in-memory state over to htmx. There is no clean way to do this, so it goes through `x-bind:hx-vals="JSON.stringify(...)"`. Alpine serializes its selection so htmx can deserialize it into a form body so the server can deserialize it again. Two frameworks negotiating over the same state, in two different attribute namespaces, with no shared type.

This is the _component locality_ problem. The behavior lives in one file, the markup in another, the types implied by `data-*` attributes exist nowhere, and the handoff between Alpine and htmx is a stringly-typed protocol you invent each time.

## The rewrite that wasn't

The temptation, of course, is to rip the bandage off. Pick Next.js or Remix or SvelteKit, port everything over the next two quarters, and live happily ever after. We are not doing that. The htmx app works. Half of it would not benefit from React-style state management at all. A rewrite would burn months and ship nothing new to customers in the meantime. It is not the right trade.

The Astro insight is the one I wish I had earlier: **server-render everything, ship JavaScript only where it earns its keep.** Astro calls these islands. Most of your page is HTML, with small interactive components dotted through it. The trouble with Astro itself, for us, is that Astro is its own server. We already have Elysia. We already have our auth, our middleware, our htmx, our routing. We want islands without giving up any of that.

[HonoX](https://github.com/honojs/honox) is the other option worth naming. It is a Hono-based meta-framework with Vite-backed islands hydration, and it supports React, Preact, and Solid. But "getting started" in HonoX is not a library install. It means a prescribed project layout: `app/server.ts` with `createApp()`, `app/client.ts`, `app/global.d.ts`, a `_renderer.tsx` file, all your routes rewritten as `createRoute()` calls inside `app/routes/`, and islands placed in `app/islands/` or named with a `$` prefix. Islands cannot access the request context, so data has to be threaded down from route files. The build is two steps. If you are starting a new project on Hono and are happy building inside those conventions, it is a reasonable choice. If you already have a running Elysia or Hono app with its own structure, adopting HonoX means migrating into its layout, and you are back to the rewrite problem by a different name.

What I wanted was a layer, not a framework. Something that adds islands to the server I already have, leaves htmx alone, and gets out of the way.

## Atollic

So I built [Atollic](https://github.com/awilderink/atollic). One sentence: **Astro-style islands for any WinterCG server.**

Bring your own server (Elysia, Hono, Bun, Workers, anything that speaks `Request`/`Response`). Bring your own UI framework via an adapter. Solid and React ship today; Preact and others are pluggable. Each island picks its framework via the JSX pragma, so you can have a React island next to a Solid island on the same page — useful when one component has a React-only dependency and you do not want to rewrite everything to match. Mark a component with `"use client"` and Atollic SSRs it on the server, then hydrates it on the client. Everything else is zero-JS HTML.

The same picker, as a single Solid island, looks like this:

```typescript
/** @jsxImportSource solid-js */
"use client";

import { createSignal, For } from "solid-js";

type Task = { id: string; name: string; hours: number };

export default function TaskPicker(props: { tasks: Task[] }) {
  const [selected, setSelected] = createSignal<Set<string>>(new Set());

  const total = () =>
    props.tasks
      .filter((t) => selected().has(t.id))
      .reduce((sum, t) => sum + t.hours, 0);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div>
      <For each={props.tasks}>
        {(task) => (
          <label>
            <input
              type="checkbox"
              checked={selected().has(task.id)}
              onChange={() => toggle(task.id)}
            />
            {task.name} ({task.hours}h)
          </label>
        )}
      </For>

      <p>Total: {total()}h</p>

      <form hx-post="/invoice" hx-target="closest .order-panel">
        <For each={[...selected()]}>
          {(id) => <input type="hidden" name="task_ids" value={id} />}
        </For>
        <button type="submit" disabled={selected().size === 0}>
          Create invoice
        </button>
      </form>
    </div>
  );
}
```

One file. The tasks are a typed `Task[]` prop. No `data-*` attributes, no `Number()` casts, no `Record<string, number>`. Selection is a typed `Set<string>` signal. The submit button is a normal HTML form posting `task_ids`, so htmx and the rest of the page can swap whatever they want around it without coordination, and the form still works in a `<noscript>` page.

And critically: htmx swaps still work. Atollic installs a `MutationObserver` on `document.body`, so when an htmx swap drops a fresh `<TaskPicker>` into the DOM, it gets mounted automatically. No `htmx:afterSwap` listeners. No re-init code. It just works the way you would naively expect.

## What we get back

- **Locality, both kinds.** For interactions, state + behavior + markup + types live in one file. For features that span multiple UI regions, the island _is_ the boundary. No more fan-out of `hx-swap-oob` targets glued by string IDs across unrelated routes.
- **Type safety across the seam.** Props are serialized and typed on both sides. No more "oh, I forgot the server is sending a string."
- **Zero JS where it does not earn its keep.** Pages without islands ship zero JavaScript. No client framework on the listings page.
- **htmx is still in charge.** Routing, navigation, server fetches, partial swaps, all htmx, exactly as before. Your UI framework only owns the gnarly parts.
- **No rewrite.** We dropped one component into one wizard. Nothing else moved. The other 90% of the app does not know islands exist.

## Where this is at, honestly

Atollic is `v0.0.x`. It is a real working library that ships our import wizard in production. The API will move before 1.0 and there are sharp edges. If you want the safest possible "boring stack" decision, this is not it.

If you want the smallest possible escape hatch out of "htmx is starting to hurt in the complex corners" without throwing away the parts that work, `bun add atollic`, [read the README](https://github.com/awilderink/atollic), and tell me what breaks.

## Help shape it

Atollic is small enough that one motivated person can move it forward in a weekend, and there is plenty of room for hands. If any of this sounds like a problem you have lived with, I would love your help making it better. A few concrete things that would land hard right now:

- **A Preact adapter.** The `FrameworkAdapter` interface is small. Solid is the reference implementation, React is the second. Preact should be straightforward.
- **A Node fetch adapter recipe** for people not on Bun.
- **Examples.** Real little apps using Atollic with Hono, with Workers, with htmx in anger. If you build one, I will link it.
- **Bug reports.** Especially weird ones. The sharp edges only get sanded down when someone bumps into them.
- **Docs.** The README is the docs right now, and that is not going to be true forever.

Issues and PRs are open at [github.com/awilderink/atollic](https://github.com/awilderink/atollic). If you want to talk through an idea before you write code, open a discussion or just ping me. No contribution is too small. A typo fix is a contribution.

And whether or not you write a line of code: I am very interested in where your htmx app starts to hurt. Drop it in the comments.
