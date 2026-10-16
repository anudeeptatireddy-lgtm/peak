# peak

peak is a website where people see an animation they love, tweak it with sliders, copy a ready-made prompt, and build their own version with Claude Code. It launches with 50 animations that travel through 16 color worlds.

## Run it

You need [Node.js](https://nodejs.org/) 22.12 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

## Useful commands

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Starts the local site and reloads as you edit |
| `npm run build`    | Builds the finished site into `dist/`         |
| `npm run preview`  | Serves the built site locally                 |
| `npm run check`    | Type checks, formatting check and unit tests  |
| `npm run test:e2e` | Browser tests (desktop and phone sizes)       |
| `npm run format`   | Fixes formatting                              |

## Docs

- [`docs/PRD.md`](docs/PRD.md): what peak is and how it should work
- [`docs/SCENES.md`](docs/SCENES.md): all 50 animations
- [`docs/PLAN.md`](docs/PLAN.md): the build order (type `/next` in Claude Code to do the next step)
- [`docs/DECISIONS.md`](docs/DECISIONS.md): decisions and open questions
- [`CLAUDE.md`](CLAUDE.md): how Claude Code works on this project
