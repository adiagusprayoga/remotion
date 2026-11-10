import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = {
  title: string;
};

export const HelloWorld: React.FC<Props> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 140,
          margin: 0,
          transform: `scale(${scale})`,
          opacity,
          textAlign: "center",
          textShadow: "0 10px 40px rgba(99,102,241,0.6)",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          color: "#c7d2fe",
          fontSize: 48,
          marginTop: 24,
          opacity,
        }}
      >
        Rendered with Remotion · frame {frame}
      </p>
    </AbsoluteFill>
  );
};
