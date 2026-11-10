import type { VideoTheme } from "../types";
import { FONT_FAMILY } from "../font";

export type ThemePreset = {
  id: string;
  keywords: string[];
  theme: VideoTheme;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    keywords: ["tech", "teknologi", "ai", "data", "software", "coding", "startup", "digital"],
    theme: {
      fontFamily: FONT_FAMILY,
      textColor: "#f8fafc",
      accentColor: "#818cf8",
      palette: [
        ["#0f172a", "#1e293b", "#312e81"],
        ["#111827", "#1f2937", "#4c1d95"],
        ["#0b1120", "#172554", "#1e3a8a"],
      ],
    },
  },
  {
    id: "sunset",
    keywords: ["sale", "promo", "diskon", "event", "launch", "peluncuran", "energi", "semangat"],
    theme: {
      fontFamily: FONT_FAMILY,
      textColor: "#fff7ed",
      accentColor: "#fb923c",
      palette: [
        ["#7c2d12", "#c2410c", "#f97316"],
        ["#831843", "#be123c", "#fb7185"],
        ["#78350f", "#b45309", "#f59e0b"],
      ],
    },
  },
  {
    id: "forest",
    keywords: ["alam", "nature", "lingkungan", "kesehatan", "health", "hijau", "green", "eco"],
    theme: {
      fontFamily: FONT_FAMILY,
      textColor: "#f0fdf4",
      accentColor: "#4ade80",
      palette: [
        ["#052e16", "#14532d", "#166534"],
        ["#064e3b", "#047857", "#10b981"],
        ["#1a2e05", "#3f6212", "#65a30d"],
      ],
    },
  },
  {
    id: "candy",
    keywords: ["fun", "kids", "anak", "ceria", "happy", "birthday", "ulang tahun", "game"],
    theme: {
      fontFamily: FONT_FAMILY,
      textColor: "#ffffff",
      accentColor: "#f0abfc",
      palette: [
        ["#4c1d95", "#7e22ce", "#c026d3"],
        ["#831843", "#db2777", "#f472b6"],
        ["#1e3a8a", "#2563eb", "#60a5fa"],
      ],
    },
  },
  {
    id: "mono",
    keywords: ["minimal", "formal", "bisnis", "business", "corporate", "laporan", "report"],
    theme: {
      fontFamily: FONT_FAMILY,
      textColor: "#f4f4f5",
      accentColor: "#a1a1aa",
      palette: [
        ["#09090b", "#18181b", "#27272a"],
        ["#111113", "#1c1c1f", "#3f3f46"],
        ["#0a0a0a", "#171717", "#262626"],
      ],
    },
  },
];

export const DEFAULT_THEME = THEME_PRESETS[0].theme;

export const pickTheme = (prompt: string): VideoTheme => {
  const lower = prompt.toLowerCase();
  const match = THEME_PRESETS.find((preset) =>
    preset.keywords.some((keyword) => lower.includes(keyword)),
  );
  return (match ?? THEME_PRESETS[0]).theme;
};
