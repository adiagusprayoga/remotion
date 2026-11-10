import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TextAnimation } from "../types";

type Props = {
  text: string;
  animation?: TextAnimation;
  delay?: number;
  style?: React.CSSProperties;
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const AnimatedText: React.FC<Props> = ({
  text,
  animation = "fadeUp",
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const progress = spring({
    frame: local,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(fps * 0.8),
  });

  const base: React.CSSProperties = {
    margin: 0,
    ...style,
  };

  if (animation === "fadeIn") {
    const opacity = interpolate(local, [0, fps * 0.6], [0, 1], clamp);
    return <p style={{ ...base, opacity }}>{text}</p>;
  }

  if (animation === "scaleIn") {
    const scale = interpolate(progress, [0, 1], [0.6, 1]);
    return (
      <p style={{ ...base, opacity: progress, transform: `scale(${scale})` }}>
        {text}
      </p>
    );
  }

  if (animation === "slideLeft") {
    const translateX = interpolate(progress, [0, 1], [120, 0]);
    return (
      <p
        style={{
          ...base,
          opacity: progress,
          transform: `translateX(${translateX}px)`,
        }}
      >
        {text}
      </p>
    );
  }

  if (animation === "typewriter") {
    const charsPerFrame = 0.6;
    const visible = Math.max(0, Math.floor(local * charsPerFrame));
    const shown = text.slice(0, visible);
    const caretOn = Math.floor(local / 8) % 2 === 0 && visible < text.length;
    return (
      <p style={{ ...base, whiteSpace: "pre-wrap" }}>
        {shown}
        <span style={{ opacity: caretOn ? 1 : 0 }}>|</span>
      </p>
    );
  }

  const translateY = interpolate(progress, [0, 1], [60, 0]);
  return (
    <p
      style={{
        ...base,
        opacity: progress,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </p>
  );
};
