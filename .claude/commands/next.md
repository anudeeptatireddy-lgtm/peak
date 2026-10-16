Do the next step of the peak build.

1. Open `docs/PLAN.md` and find the first step whose checkbox is `[ ]`. If the step before it is a Checkpoint the owner hasn't confirmed, stop and ask the owner to confirm it.
2. Tell me in one line which step you're doing and what it will produce.
3. Read the PRD sections that step references in `docs/PRD.md`. If something is unclear or needs an owner decision, ask me before writing code.
4. Implement only that step.
5. Run its "Done when" checks plus `npm run check` (and `npm run test:e2e` if pages changed). Fix until everything passes.
6. Tick the step's box in `docs/PLAN.md`, log any decisions in `docs/DECISIONS.md`, and commit with the message `step N.M: <summary>`.
7. Finish with a short, plain-language summary: what changed, what to open in the browser to see it, and the next step's name. Then stop.
