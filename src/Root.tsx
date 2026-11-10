import { Composition } from "remotion";
import { DynamicVideo, computeDurationInFrames } from "./scenes/DynamicVideo";
import type { VideoSpec } from "./types";
import defaultSpec from "./generated/video-spec.json";

export const RemotionRoot: React.FC = () => {
  const spec = defaultSpec as VideoSpec;
  return (
    <>
      <Composition
        id="PromptVideo"
        component={DynamicVideo}
        durationInFrames={computeDurationInFrames(spec)}
        fps={spec.meta.fps}
        width={spec.meta.width}
        height={spec.meta.height}
        defaultProps={spec}
        calculateMetadata={({ props }) => ({
          durationInFrames: computeDurationInFrames(props),
          fps: props.meta.fps,
          width: props.meta.width,
          height: props.meta.height,
        })}
      />
    </>
  );
};
