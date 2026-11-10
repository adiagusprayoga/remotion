# remotion

Video project built with [Remotion](https://www.remotion.dev/) — create videos in React.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
```

The first render also downloads Chrome Headless Shell automatically.

## Commands

| Command | Description |
| --- | --- |
| `npm start` | Open Remotion Studio (default port 3000) |
| `npm run studio` | Studio bound to `0.0.0.0:3000` (for remote/container access) |
| `npm run build` | Render `HelloWorld` to `out/video.mp4` |
| `npx remotion compositions src/index.ts` | List available compositions |

## Project structure

```
src/
  index.ts       # entry point, calls registerRoot()
  Root.tsx       # composition registration
  HelloWorld.tsx # sample composition (1920x1080, 30fps, 5s)
```

## Adding a composition

1. Create a component in `src/` (use `useCurrentFrame`, `interpolate`, `spring`, etc.).
2. Register it in `src/Root.tsx` with a `<Composition>` and a unique `id`.
3. Run `npx remotion render <id> out/<name>.mp4`.
