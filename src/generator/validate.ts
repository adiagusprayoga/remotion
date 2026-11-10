import type { SceneSpec, VideoSpec } from "../types";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const isHex = (value: unknown): value is string =>
  typeof value === "string" && HEX.test(value.trim());

const sanitizeColors = (colors: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(colors)) return fallback;
  const valid = colors.filter(isHex);
  return valid.length >= 1 ? valid : fallback;
};

const clampDuration = (value: unknown, fps: number): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return Math.round(3.5 * fps);
  const min = Math.round(1.5 * fps);
  const max = Math.round(15 * fps);
  return Math.min(max, Math.max(min, Math.round(numeric)));
};

const VALID_TRANSITIONS = ["none", "fade", "slide", "wipe", "flip"];
const VALID_ANIMATIONS = [
  "fadeUp",
  "fadeIn",
  "scaleIn",
  "slideLeft",
  "typewriter",
];

export const validateSpec = (spec: VideoSpec): VideoSpec => {
  const fps = Number.isFinite(spec.meta?.fps) ? spec.meta.fps : 30;
  const width = Number.isFinite(spec.meta?.width) ? spec.meta.width : 1920;
  const height = Number.isFinite(spec.meta?.height) ? spec.meta.height : 1080;
  const palette =
    Array.isArray(spec.theme?.palette) && spec.theme.palette.length > 0
      ? spec.theme.palette.map((colors) =>
          sanitizeColors(colors, ["#0f172a", "#312e81"]),
        )
      : [["#0f172a", "#312e81"]];

  const theme = {
    fontFamily:
      typeof spec.theme?.fontFamily === "string" && spec.theme.fontFamily
        ? spec.theme.fontFamily
        : "sans-serif",
    textColor: isHex(spec.theme?.textColor) ? spec.theme.textColor : "#f8fafc",
    accentColor: isHex(spec.theme?.accentColor)
      ? spec.theme.accentColor
      : "#818cf8",
    palette,
  };

  const scenes: SceneSpec[] = (spec.scenes ?? []).map((scene, index) => ({
    id: typeof scene.id === "string" && scene.id ? scene.id : `scene-${index + 1}`,
    durationInFrames: clampDuration(scene.durationInFrames, fps),
    transition: VALID_TRANSITIONS.includes(scene.transition ?? "")
      ? scene.transition
      : "fade",
    background: {
      type: scene.background?.type === "solid" ? "solid" : "gradient",
      colors: sanitizeColors(
        scene.background?.colors,
        palette[index % palette.length],
      ),
      angle:
        typeof scene.background?.angle === "number"
          ? scene.background.angle
          : 135,
    },
    title: typeof scene.title === "string" ? scene.title : undefined,
    subtitle: typeof scene.subtitle === "string" ? scene.subtitle : undefined,
    bulletPoints: Array.isArray(scene.bulletPoints)
      ? scene.bulletPoints.filter((item) => typeof item === "string").slice(0, 6)
      : undefined,
    animation: VALID_ANIMATIONS.includes(scene.animation ?? "")
      ? scene.animation
      : "fadeUp",
    accentColor: isHex(scene.accentColor) ? scene.accentColor : undefined,
  }));

  if (scenes.length === 0) {
    throw new Error("VideoSpec must contain at least one scene");
  }

  return {
    meta: {
      title:
        typeof spec.meta?.title === "string" && spec.meta.title
          ? spec.meta.title
          : "Untitled",
      fps,
      width,
      height,
    },
    theme,
    scenes,
  };
};
