export type TransitionType = "none" | "fade" | "slide" | "wipe" | "flip";

export type BackgroundType = "gradient" | "solid";

export type TextAnimation =
  | "fadeUp"
  | "fadeIn"
  | "scaleIn"
  | "slideLeft"
  | "typewriter";

export type SceneBackground = {
  type: BackgroundType;
  colors: string[];
  angle?: number;
};

export type SceneSpec = {
  id: string;
  durationInFrames: number;
  transition?: TransitionType;
  background: SceneBackground;
  title?: string;
  subtitle?: string;
  bulletPoints?: string[];
  animation?: TextAnimation;
  accentColor?: string;
};

export type VideoTheme = {
  fontFamily: string;
  textColor: string;
  accentColor: string;
  palette: string[][];
};

export type VideoMeta = {
  title: string;
  fps: number;
  width: number;
  height: number;
};

export type VideoSpec = {
  meta: VideoMeta;
  theme: VideoTheme;
  scenes: SceneSpec[];
};
