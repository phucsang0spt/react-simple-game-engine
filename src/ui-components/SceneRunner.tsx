import {
  ComponentType,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Sketch } from "./Sketch";

import { Scene } from "../classes/scene";
import { Camera } from "../classes/camera";

export type SceneRunnerPublicProps = {
  width: number;
  height: number;
  assetsLoader?: ReactNode | ComponentType;
  assetsDelay?: number; //ms
};

type SceneRunnerProps = SceneRunnerPublicProps & {
  current: Scene;
};

export function SceneRunner({
  assetsDelay,
  current,
  width,
  height,
  assetsLoader: AssetsLoader,
}: SceneRunnerProps) {
  const [isBootDone, setBootDone] = useState(false);

  useEffect(() => {
    current.loadAssets(assetsDelay);
  }, [current, assetsDelay]);

  const setup = function (camera: Camera) {
    current.bootstrap(camera);
    setBootDone(true);
  };

  const draw = function () {
    current.action();
  };

  const assetsLoader: ReactElement = useMemo(() => {
    if (typeof AssetsLoader === "function") {
      return <AssetsLoader />;
    }
    return (AssetsLoader ?? <div>Assets loading...</div>) as any;
  }, [AssetsLoader]);

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
        {isBootDone ? (
          <current.UI scene={current} {...current.UIProps} />
        ) : (
          <div>{/* //todo */}</div>
        )}
      </div>
    </div>
  ) : (
    assetsLoader
  );
}
