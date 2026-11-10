import type { SceneSpec, TextAnimation, TransitionType, VideoSpec } from "../types";
import { FONT_FAMILY } from "../font";
import { DEFAULT_THEME, THEME_PRESETS, pickTheme } from "./theme";

export type GenerateOptions = {
  fps?: number;
  width?: number;
  height?: number;
  secondsPerScene?: number;
  themeId?: string;
};

const TRANSITIONS: TransitionType[] = ["fade", "slide", "wipe", "flip"];
const ANIMATIONS: TextAnimation[] = ["fadeUp", "slideLeft", "scaleIn", "fadeIn"];

const clean = (line: string): string =>
  line
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[\s\-*•\d.)]+/, "")
    .replace(/\*\*/g, "")
    .trim();

const isHeadingLine = (line: string): boolean =>
  /^#{1,3}\s+/.test(line.trim());

const titleCase = (value: string): string =>
  value
    .split(/\s+/)
    .map((word) =>
      word.length > 3 ? word[0].toUpperCase() + word.slice(1) : word,
    )
    .join(" ");

/**
 * Deterministic parser that turns a free-form prompt into a VideoSpec.
 * Used as a fallback when no LLM is configured, and as the base structure
 * that an LLM is asked to fill in.
 */
export const generateSpecFromPrompt = (
  prompt: string,
  options: GenerateOptions = {},
): VideoSpec => {
  const fps = options.fps ?? 30;
  const width = options.width ?? 1920;
  const height = options.height ?? 1080;
  const secondsPerScene = options.secondsPerScene ?? 3.5;

  const lines = prompt
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const theme = options.themeId
    ? (THEME_PRESETS.find((preset) => preset.id === options.themeId)?.theme ??
      DEFAULT_THEME)
    : pickTheme(prompt);

  const blocks: { title?: string; body: string[] }[] = [];
  let current: { title?: string; body: string[] } | null = null;

  for (const line of lines) {
    if (isHeadingLine(line)) {
      current = { title: clean(line), body: [] };
      blocks.push(current);
      continue;
    }
    if (!current) {
      current = { body: [] };
      blocks.push(current);
    }
    current.body.push(line);
  }

  if (blocks.length === 0) {
    blocks.push({ body: [prompt] });
  }

  const introBlock = blocks[0];
  const introTitle = clean(introBlock.title ?? introBlock.body[0] ?? prompt);
  const introBullets = introBlock.title
    ? introBlock.body.map(clean).filter(Boolean)
    : introBlock.body.map(clean).filter(Boolean).slice(1);

  const scenes: SceneSpec[] = [];
  const durationInFrames = Math.round(secondsPerScene * fps);

  scenes.push({
    id: "intro",
    durationInFrames: Math.round(3 * fps),
    transition: "fade",
    background: {
      type: "gradient",
      colors: theme.palette[0],
      angle: 135,
    },
    title: titleCase(introTitle),
    subtitle: introBlock.title ? introBullets[0] : undefined,
    bulletPoints:
      introBullets.length > 1 && !introBlock.title
        ? introBullets.slice(0, 4)
        : undefined,
    animation: "fadeUp",
    accentColor: theme.accentColor,
  });

  blocks.slice(1).forEach((block, index) => {
    const body = block.body.map(clean).filter(Boolean);
    const bullets = block.title ? body : body.slice(1);
    if (!block.title && bullets.length === 0) return;

    scenes.push({
      id: `scene-${scenes.length}`,
      durationInFrames,
      transition: TRANSITIONS[index % TRANSITIONS.length],
      background: {
        type: "gradient",
        colors: theme.palette[(index + 1) % theme.palette.length],
        angle: 135,
      },
      title: block.title ? titleCase(block.title) : titleCase(body[0] ?? ""),
      bulletPoints: bullets.slice(0, 5),
      animation: ANIMATIONS[index % ANIMATIONS.length],
      accentColor: theme.accentColor,
    });
  });

  // A single-scene spec renders as a static card. Add a closing scene so even
  // one-line prompts produce a moving video.
  if (scenes.length === 1) {
    scenes.push({
      id: "outro",
      durationInFrames: Math.round(2.5 * fps),
      transition: "fade",
      background: {
        type: "gradient",
        colors: theme.palette[1 % theme.palette.length],
        angle: 135,
      },
      title: introTitle,
      subtitle: "Terima kasih",
      animation: "scaleIn",
      accentColor: theme.accentColor,
    });
  }

  return {
    meta: {
      title: titleCase(introTitle),
      fps,
      width,
      height,
    },
    theme: { ...theme, fontFamily: FONT_FAMILY },
    scenes,
  };
};
