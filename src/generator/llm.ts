import type { VideoSpec } from "../types";
import { generateSpecFromPrompt, type GenerateOptions } from "./generate";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export const buildSystemPrompt = (options: GenerateOptions): string => {
  const fps = options.fps ?? 30;
  const width = options.width ?? 1920;
  const height = options.height ?? 1080;
  const secondsPerScene = options.secondsPerScene ?? 3.5;

  return [
    "You are a video storyboard generator. Given a user prompt, respond with ONLY valid JSON (no markdown fences) describing a short motion-graphics video.",
    "",
    "JSON shape:",
    `{
  "meta": { "title": string, "fps": ${fps}, "width": ${width}, "height": ${height} },
  "theme": {
    "fontFamily": string,
    "textColor": string,
    "accentColor": string,
    "palette": string[][]   // each entry is 2-4 CSS hex colors used as a gradient
  },
  "scenes": [
    {
      "id": string,
      "durationInFrames": number,   // about ${Math.round(secondsPerScene * fps)} frames per scene
      "transition": "none" | "fade" | "slide" | "wipe" | "flip",
      "background": { "type": "gradient" | "solid", "colors": string[], "angle": number },
      "title": string,
      "subtitle": string,
      "bulletPoints": string[],
      "animation": "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "typewriter",
      "accentColor": string
    }
  ]
}`,
    "",
    "Rules:",
    "- Produce between 3 and 6 scenes.",
    "- Keep titles under 8 words and bullets under 10 words.",
    "- Use high-contrast color pairs so text stays readable.",
    "- The first scene should be a title/intro scene.",
    "- Respond with JSON only.",
  ].join("\n");
};

const extractJson = (raw: string): unknown => {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in LLM output");
  return JSON.parse(trimmed.slice(start, end + 1));
};

const isVideoSpec = (value: unknown): value is VideoSpec => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<VideoSpec>;
  return (
    typeof candidate.meta === "object" &&
    Array.isArray(candidate.scenes) &&
    candidate.scenes.length > 0 &&
    typeof candidate.theme === "object"
  );
};

/**
 * Uses an OpenAI-compatible chat completions endpoint to turn a free-form
 * prompt into a VideoSpec. Falls back to the deterministic parser when no
 * API key is configured or the request fails.
 */
export const generateSpecWithLlm = async (
  prompt: string,
  options: GenerateOptions = {},
): Promise<{ spec: VideoSpec; usedLlm: boolean }> => {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return { spec: generateSpecFromPrompt(prompt, options), usedLlm: false };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(options) },
    { role: "user", content: prompt },
  ];

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty LLM response");

    const parsed = extractJson(content) as VideoSpec;
    if (!isVideoSpec(parsed)) throw new Error("LLM output did not match VideoSpec");

    const fallback = generateSpecFromPrompt(prompt, options);
    const spec: VideoSpec = {
      meta: { ...fallback.meta, ...parsed.meta },
      theme: { ...fallback.theme, ...parsed.theme },
      scenes: parsed.scenes.map((scene, index) => ({
        ...fallback.scenes[index % fallback.scenes.length],
        ...scene,
        id: scene.id ?? `scene-${index + 1}`,
      })),
    };
    return { spec, usedLlm: true };
  } catch (error) {
    console.warn(
      `[generate] LLM generation failed, falling back to deterministic parser: ${
        (error as Error).message
      }`,
    );
    return { spec: generateSpecFromPrompt(prompt, options), usedLlm: false };
  }
};
