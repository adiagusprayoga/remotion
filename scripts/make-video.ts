#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { VideoSpec } from "../src/types";
import { generateSpecFromPrompt } from "../src/generator/generate";
import { generateSpecWithLlm } from "../src/generator/llm";
import { validateSpec } from "../src/generator/validate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

type Args = {
  prompt?: string;
  promptFile?: string;
  out?: string;
  spec?: string;
  propsOnly: boolean;
  noRender: boolean;
  printJson: boolean;
  theme?: string;
  fps?: number;
  secondsPerScene?: number;
  width?: number;
  height?: number;
};

const parseArgs = (argv: string[]): Args => {
  const args: Args = { propsOnly: false, noRender: false, printJson: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = () => argv[++i];
    switch (token) {
      case "--prompt":
      case "-p":
        args.prompt = next();
        break;
      case "--prompt-file":
        args.promptFile = next();
        break;
      case "--out":
      case "-o":
        args.out = next();
        break;
      case "--spec":
        args.spec = next();
        break;
      case "--theme":
        args.theme = next();
        break;
      case "--fps":
        args.fps = Number(next());
        break;
      case "--width":
        args.width = Number(next());
        break;
      case "--height":
        args.height = Number(next());
        break;
      case "--seconds":
      case "--seconds-per-scene":
        args.secondsPerScene = Number(next());
        break;
      case "--props-only":
        args.propsOnly = true;
        break;
      case "--no-render":
        args.noRender = true;
        break;
      case "--print-json":
        args.printJson = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
      default:
        if (token.startsWith("--")) {
          console.error(`Unknown option: ${token}`);
          process.exit(1);
        }
    }
  }
  return args;
};

const printHelp = () => {
  console.log(`
Generate and render a motion video from a prompt.

Usage:
  npm run video -- --prompt "<text>" [options]

Options:
  -p, --prompt <text>        Prompt text (or use --prompt-file)
      --prompt-file <path>   Read the prompt from a file
  -o, --out <path>           Output mp4 path (default out/video.mp4)
      --spec <path>          Reuse an existing VideoSpec JSON (skip generation)
      --theme <id>           Force a theme preset id
      --fps <number>         Frames per second (default 30)
      --width <number>       Video width (default 1920)
      --height <number>      Video height (default 1080)
      --seconds <number>     Target seconds per scene (default 3.5)
      --props-only           Write props.json but do not render
      --no-render            Same as --props-only
      --print-json           Print the generated spec to stdout
  -h, --help                 Show this help

Examples:
  npm run video -- --prompt "Promo produk kopi, tema hangat, 4 scene"
  npm run video -- --prompt-file prompts/promo.txt --out out/promo.mp4
  npm run video -- --spec src/generated/video-spec.json --no-render
`);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (!args.prompt && !args.promptFile && !args.spec) {
    printHelp();
    process.exit(args.printJson ? 0 : 1);
  }

  const outPath = resolve(root, args.out ?? "out/video.mp4");
  const propsPath = resolve(root, "out/props.json");

  let spec: VideoSpec;

  if (args.spec) {
    const specPath = resolve(root, args.spec);
    spec = JSON.parse(readFileSync(specPath, "utf8")) as VideoSpec;
  } else {
    const prompt = args.promptFile
      ? readFileSync(resolve(root, args.promptFile), "utf8")
      : (args.prompt as string);

    const options = {
      fps: args.fps,
      width: args.width,
      height: args.height,
      secondsPerScene: args.secondsPerScene,
      themeId: args.theme,
    };

    const result = await generateSpecWithLlm(prompt, options);
    spec = result.spec;
    if (result.usedLlm) {
      console.log("🧠 Storyboard generated with LLM");
    } else {
      console.log("🧩 Storyboard generated with deterministic parser");
    }
  }

  spec = validateSpec(spec);

  if (args.printJson) {
    console.log(JSON.stringify(spec, null, 2));
  }

  const totalFrames = spec.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  console.log(
    `🎬 "${spec.meta.title}" — ${spec.scenes.length} scenes, ${spec.meta.width}x${spec.meta.height} @ ${spec.meta.fps}fps`,
  );
  console.log(`   ≈ ${(totalFrames / spec.meta.fps).toFixed(1)}s (before transitions)`);

  mkdirSync(dirname(propsPath), { recursive: true });
  writeFileSync(propsPath, JSON.stringify(spec, null, 2));
  console.log(`📝 Props written to ${propsPath}`);

  if (args.noRender || args.propsOnly) {
    console.log("⏭️  Skipping render (--no-render).");
    return;
  }

  mkdirSync(dirname(outPath), { recursive: true });
  console.log("🎥 Rendering...");
  execFileSync(
    "npx",
    ["remotion", "render", "PromptVideo", outPath, `--props=${propsPath}`],
    { stdio: "inherit", cwd: root },
  );
  console.log(`✅ Done: ${outPath}`);
};

main().catch((error) => {
  console.error(`❌ ${(error as Error).message}`);
  process.exit(1);
});
