# remotion — Prompt-Driven Motion Video Generator

A [Remotion](https://www.remotion.dev/) project that turns a **text prompt** into a rendered motion video. Write a prompt, get an MP4.

```
prompt  →  generator  →  video-spec JSON  →  Remotion scenes  →  MP4
           (LLM or         (storyboard)        (React + animations)
          fallback)
```

## Quick start

```bash
npm install
npm start          # open Remotion Studio (port 3000)
```

Generate a video straight from a prompt:

```bash
npm run video -- --prompt "Promo aplikasi kasir untuk UMKM, tema hangat, 4 scene"
# → out/video.mp4
```

From a file:

```bash
npm run video -- --prompt-file prompts/example.txt --out out/promo.mp4
```

Just preview the storyboard without rendering:

```bash
npm run video -- --prompt "..." --no-render   # writes out/props.json
npm run video -- --prompt "..." --print-json  # also prints the spec
```

## CLI reference

```
npm run video -- --prompt "<text>" [options]

  -p, --prompt <text>        Prompt text
      --prompt-file <path>   Read prompt from a file
  -o, --out <path>           Output mp4 (default out/video.mp4)
      --spec <path>          Reuse an existing VideoSpec JSON
      --theme <id>           Force theme: midnight | sunset | forest | candy | mono
      --fps <n>              Frames per second (default 30)
      --width <n>            Width (default 1920)
      --height <n>           Height (default 1080)
      --seconds <n>          Target seconds per scene (default 3.5)
      --no-render            Write props.json only
      --print-json           Print the generated spec
```

## How the prompt is interpreted

Two generators are available and chosen automatically:

1. **LLM generator** (`src/generator/llm.ts`) — used when `OPENAI_API_KEY` is set.
   Calls an OpenAI-compatible chat endpoint and asks for a JSON storyboard.
2. **Deterministic parser** (`src/generator/generate.ts`) — always available, no key
   needed. Parses markdown-ish structure: `#`/`##` headings become scene titles,
   following lines become bullet points. Theme is picked from keywords in the prompt.

If the LLM call fails for any reason, the deterministic parser is used as a fallback,
so the pipeline never breaks.

### Enabling the LLM

```bash
cp .env.example .env
# set OPENAI_API_KEY (and optionally OPENAI_BASE_URL / OPENAI_MODEL)
```

## Prompt format

Plain text works. For best structure, use headings and bullet lines:

```markdown
# Peluncuran Aplikasi Mobile

## Kecepatan
- Proses checkout hanya 2 langkah
- Sinkronisasi realtime

## Keamanan
- Enkripsi end-to-end
- Login biometrik
```

See `prompts/example.txt`.

## Project structure

```
src/
  types.ts                 # VideoSpec / SceneSpec / theme types
  font.ts                  # font family
  Root.tsx                 # registers the "PromptVideo" composition
  components/
    Background.tsx         # gradient / solid backgrounds
    AnimatedText.tsx       # fadeUp, fadeIn, scaleIn, slideLeft, typewriter
  scenes/
    Scene.tsx              # renders one scene from a SceneSpec
    DynamicVideo.tsx       # TransitionSeries wiring + duration math
  generator/
    generate.ts            # deterministic prompt → VideoSpec
    llm.ts                 # LLM prompt → VideoSpec (optional)
    theme.ts               # theme presets + keyword matching
    validate.ts            # sanitize/repair specs (colors, durations, enums)
  generated/
    video-spec.json        # default props for the Studio
scripts/
  make-video.ts            # the CLI (npm run video)
prompts/
  example.txt              # example prompt
```

## Customizing

- **Add a theme**: edit `THEME_PRESETS` in `src/generator/theme.ts`.
- **Add a text animation**: add a case in `src/components/AnimatedText.tsx`
  and extend `TextAnimation` in `src/types.ts`.
- **Change scene layout**: edit `src/scenes/Scene.tsx`.
- **New transition**: extend `TransitionType` and `presentationFor()` in
  `src/scenes/DynamicVideo.tsx`.

## Other commands

```bash
npm run typecheck      # tsc --noEmit
npm run build          # render PromptVideo with the default spec
npm run studio         # studio bound to 0.0.0.0:3000
```
