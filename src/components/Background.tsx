import { AbsoluteFill } from "remotion";
import type { SceneBackground } from "../types";

export const backgroundStyle = (
  background: SceneBackground,
): React.CSSProperties => {
  if (background.type === "solid") {
    return { backgroundColor: background.colors[0] ?? "#000000" };
  }
  const angle = background.angle ?? 135;
  const stops = background.colors.join(", ");
  return {
    backgroundImage: `linear-gradient(${angle}deg, ${stops})`,
  };
};

export const Background: React.FC<{ background: SceneBackground }> = ({
  background,
}) => <AbsoluteFill style={backgroundStyle(background)} />;
