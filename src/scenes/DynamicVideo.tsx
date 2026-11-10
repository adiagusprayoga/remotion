import React from "react";
import {
  TransitionSeries,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import type { TransitionPresentation } from "@remotion/transitions";
import type { TransitionType, VideoSpec } from "../types";
import { Scene } from "./Scene";

const TRANSITION_FRAMES = 15;

const presentationFor = (
  type: TransitionType,
): TransitionPresentation<Record<string, unknown>> => {
  switch (type) {
    case "slide":
      return slide() as TransitionPresentation<Record<string, unknown>>;
    case "wipe":
      return wipe() as TransitionPresentation<Record<string, unknown>>;
    case "flip":
      return flip() as TransitionPresentation<Record<string, unknown>>;
    case "fade":
    default:
      return fade() as TransitionPresentation<Record<string, unknown>>;
  }
};

export const DynamicVideo: React.FC<VideoSpec> = ({ theme, scenes }) => {
  const hasTransitions = scenes.some(
    (scene) => scene.transition && scene.transition !== "none",
  );

  if (!hasTransitions) {
    return (
      <TransitionSeries>
        {scenes.map((scene) => (
          <TransitionSeries.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames}
          >
            <Scene scene={scene} theme={theme} />
          </TransitionSeries.Sequence>
        ))}
      </TransitionSeries>
    );
  }

  return (
    <TransitionSeries>
      {scenes.map((scene, index) => {
        const isLast = index === scenes.length - 1;
        const transitionType = scene.transition ?? "fade";
        const showTransition =
          !isLast && transitionType !== "none" && scenes.length > 1;

        return (
          <React.Fragment key={scene.id}>
            <TransitionSeries.Sequence durationInFrames={scene.durationInFrames}>
              <Scene scene={scene} theme={theme} />
            </TransitionSeries.Sequence>
            {showTransition ? (
              <TransitionSeries.Transition
                presentation={presentationFor(transitionType)}
                timing={springTiming({
                  config: { damping: 200 },
                  durationInFrames: TRANSITION_FRAMES,
                })}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};

export const computeDurationInFrames = (spec: VideoSpec): number => {
  const total = spec.scenes.reduce(
    (sum, scene) => sum + scene.durationInFrames,
    0,
  );
  const transitions = spec.scenes.reduce((sum, scene, index) => {
    const isLast = index === spec.scenes.length - 1;
    if (isLast) return sum;
    if (!scene.transition || scene.transition === "none") return sum;
    return sum + TRANSITION_FRAMES;
  }, 0);
  return Math.max(1, total - transitions);
};
