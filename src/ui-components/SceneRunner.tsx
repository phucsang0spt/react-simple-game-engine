import { useEffect } from "react";
import { Sketch } from "./Sketch";

import { Scene } from "../classes/scene";
import { Camera } from "../classes/camera";

type SceneRunnerProps = {
  current: Scene;
  width: number;
  height: number;
};

export function SceneRunner({ current, width, height }: SceneRunnerProps) {
  useEffect(() => {
    current.loadAssets();
  }, [current]);

  const setup = function (camera: Camera) {
    current.bootstrap(camera);
  };

  const draw = function () {
    current.action();
  };

  return current.loadedAssets ? (
    <div style={{ width, height, position: "relative" }}>
      <Sketch width={width} height={height} onSetup={setup} onDraw={draw} />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          userSelect: "none",
          zIndex: 2,
        }}
      >
        <current.UI {...current.UIProps} />
      </div>
    </div>
  ) : (
    <div>Assets loading...</div>
  );
}
