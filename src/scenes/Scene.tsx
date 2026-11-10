import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SceneSpec, VideoTheme } from "../types";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { FONT_FAMILY } from "../font";

type Props = {
  scene: SceneSpec;
  theme: VideoTheme;
};

export const Scene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = scene.accentColor ?? theme.accentColor;

  const accentProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(fps * 0.6),
  });

  const bullets = scene.bulletPoints ?? [];

  return (
    <AbsoluteFill style={{ fontFamily: theme.fontFamily || FONT_FAMILY }}>
      <Background background={scene.background} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 160px",
        }}
      >
        {scene.title ? (
          <>
            <div
              style={{
                width: interpolate(accentProgress, [0, 1], [0, 180]),
                height: 10,
                borderRadius: 6,
                background: accent,
                marginBottom: 36,
              }}
            />
            <AnimatedText
              text={scene.title}
              animation={scene.animation}
              style={{
                color: theme.textColor,
                fontSize: 96,
                fontWeight: 800,
                lineHeight: 1.1,
                maxWidth: 1400,
              }}
            />
          </>
        ) : null}

        {scene.subtitle ? (
          <AnimatedText
            text={scene.subtitle}
            animation={scene.animation === "typewriter" ? "typewriter" : "fadeIn"}
            delay={Math.round(fps * 0.4)}
            style={{
              color: theme.textColor,
              opacity: 0.85,
              fontSize: 46,
              fontWeight: 400,
              marginTop: 28,
              maxWidth: 1300,
            }}
          />
        ) : null}

        {bullets.length > 0 ? (
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 22 }}>
            {bullets.map((bullet, index) => {
              const delay = Math.round(fps * (0.5 + index * 0.18));
              return (
                <AnimatedText
                  key={index}
                  text={`•  ${bullet}`}
                  animation="slideLeft"
                  delay={delay}
                  style={{
                    color: theme.textColor,
                    fontSize: 44,
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
