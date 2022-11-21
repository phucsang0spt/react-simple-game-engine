import {
  ComponentType,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Scene } from "../classes/scene";
import { SimpleCamera } from "../classes/simple-camera";
import { Scaler } from "../classes/scaler";

import { getClassName, useWindowSize } from "../utils";
import { LayoutMode } from "../export-enums";
import { AssetsFailBehavior } from "../export-types";
import { ScalerContext, UISceneContext } from "../react-context";

import { ScalerContainer } from "./scaler-container";
import { Sketch } from "./sketch";
import { MovementControl, MovementControlProps } from "./movement-control";
import { FloatContainer } from "./float-container";

export type SceneRunnerPublicProps = {
  width: number;
  height: number;
  assetsLoader?: ReactNode | ComponentType;
  assetsDelay?: number; //ms
  assetsFailBehavior?: AssetsFailBehavior;
  layoutMode?: LayoutMode;
  voidSpace?: ReactNode;
  joystick?: Omit<MovementControlProps, "scene"> | true;
};

type SceneRunnerProps = SceneRunnerPublicProps & {
  current: Scene;
};

export function SceneRunner({
  width,
  height,
  current,
  layoutMode = LayoutMode.LANDSCAPE,
  //
  voidSpace,
  assetsDelay,
  assetsFailBehavior,
  assetsLoader: AssetsLoader,
  joystick,
}: SceneRunnerProps) {
  const screenSize = useWindowSize();
  const refScaler = useRef(
    new Scaler(screenSize, { width, height }, layoutMode)
  );
  const [isBootDone, setBootDone] = useState(false);

  useMemo(() => {
    refScaler.current.screenSizeUI = {
      width: screenSize.width,
      height: screenSize.height,
    };
  }, [screenSize]);

  useMemo(() => {
    if (window.Renderer) {
      window.Renderer.resizeCanvas(width, height);
    }
    refScaler.current.canvasSize = {
      width,
      height,
    };
  }, [width, height]);

  useMemo(() => {
    refScaler.current.layoutMode = layoutMode;
  }, [layoutMode]);

  useEffect(() => {
    current.loadAssets(assetsDelay, assetsFailBehavior);
    // Don't Dependency on assetsFailBehavior
  }, [current, assetsDelay]);

  const setup = function (simpleCamera: SimpleCamera) {
    current.bootstrap(simpleCamera);
    setBootDone(true);
  };

  const handleDraw = function () {
    current.action();
  };

  const handleMouseMove = function () {
    current.mouseMove();
  };

  const handleMousePressed = function () {
    current.mousePressed();
  };

  const handleMouseRelease = function () {
    current.mouseRelease();
  };

  const assetsLoader: ReactElement = useMemo(() => {
    if (typeof AssetsLoader === "function") {
      return <AssetsLoader />;
    }
    return (AssetsLoader ?? <div>Assets loading...</div>) as any;
  }, [AssetsLoader]);

  return (
    <div
      className={getClassName("game-root")}
      style={{
        width: screenSize.width,
        height: screenSize.height,
      }}
    >
      <FloatContainer
        style={{
          zIndex: 0,
          backgroundColor: "rgb(41,41,41)",
        }}
      >
        {/* void space */}
        {voidSpace}
      </FloatContainer>

      <ScalerContainer
        value={refScaler.current.value}
        width={width}
        height={height}
      >
        {current.loadedAssets && (
          // canvas
          <Sketch
            onSetup={setup}
            onDraw={handleDraw}
            onMouseMove={handleMouseMove}
            onMousePressed={handleMousePressed}
            onMouseRelease={handleMouseRelease}
            scaler={refScaler.current}
          />
        )}
      </ScalerContainer>

      <FloatContainer
        style={{
          zIndex: 2,
        }}
      >
        {!current.loadedAssets ? (
          <>
            {current.renderAssetsFail
              ? (function () {
                  const rendered = current.renderAssetsFail();
                  if (Array.isArray(rendered)) {
                    return (
                      <div className={getClassName("assets-fail-view")}>
                        {rendered.map((item, i) => (
                          <p key={i}>
                            - {item.type}: {item.detail}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return rendered;
                })()
              : assetsLoader}
          </>
        ) : (
          <>
            {isBootDone ? (
              <UISceneContext.Provider value={current}>
                <ScalerContext.Provider value={refScaler.current}>
                  <current.UI scene={current} {...current.getUIProps()} />
                  {joystick && (
                    <MovementControl {...(joystick === true ? {} : joystick)} />
                  )}
                  <div
                    className={getClassName("scene-modal-stack")}
                    id="scene-modal-stack"
                  />
                </ScalerContext.Provider>
              </UISceneContext.Provider>
            ) : (
              <div>{/* //todo */}</div>
            )}
          </>
        )}
      </FloatContainer>
    </div>
  );
}
