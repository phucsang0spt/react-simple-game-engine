import { useEffect, useMemo, useState } from "react";

import { SceneManagement, SceneClass } from "../classes/scene-management";
import { getClassName } from "../utils";
import { Logger } from "./logger";
import { SceneRunner, SceneRunnerPublicProps } from "./scene-runner";

type WorldViewProps = SceneRunnerPublicProps & {
  scenes: SceneClass[];
  logPopup?: boolean;
};

export function GameBootstrap({ logPopup, scenes, ...props }: WorldViewProps) {
  const sceneManagement = useMemo(() => {
    return new SceneManagement(scenes);
  }, [scenes]);

  const [currentScene, setCurrentScene] = useState(
    sceneManagement.currentScene
  );
  const [, setLoadedAssets] = useState(currentScene.loadedAssets);
  const [, setLoadAssetsError] = useState([]);

  useEffect(() => {
    sceneManagement.onChangeScene((scene) => {
      setCurrentScene(scene);
      setLoadedAssets(scene.loadedAssets);
    });
  }, [sceneManagement]);

  useEffect(() => {
    currentScene.onLoadAssetNotify((isLoaded, errors) => {
      setLoadedAssets(isLoaded);
      if (errors) {
        setLoadAssetsError(errors);
      }
    });
  }, [currentScene]);

  useEffect(() => {
    const style: HTMLStyleElement =
      document.getElementById("game-container-style-wrap") ||
      (document.createElement("style") as any);

    style.id = "game-container-style-wrap";

    document.head.appendChild(style);

    const gameRootClass = getClassName("game-root");
    const gameLoggerClass = getClassName("game-logger");
    style.appendChild(
      document.createTextNode(`
          .${getClassName("assets-fail-view")}{
            background-color: #f28181a1;
            min-height: 100px;
            padding: 10px;
            color: #000;
          }
          
          .${getClassName("game-modal")} {
            position: fixed;
            top: 0;
            left: 0;
          }

          .${getClassName("scene-modal-stack")}{
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            z-index: 2;
          }
          
          .${getClassName("modal-content-main")}{
            position: relative;
            z-index: 1;
            min-width: 200px;
            min-height: 200px;
          }

          .${getClassName("modal-content-closer")}{
            width: 100%;
            height: 100%;
            position: absolute;
            z-index: 0;
          }
          .${getClassName("modal-content-centered")}{
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .${getClassName("modal-content-wrap")}{
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          .${gameRootClass}, .${gameRootClass} *,
          .${gameLoggerClass}, .${gameLoggerClass} *
          {
              box-sizing: border-box;
              -webkit-touch-callout: none;
              -webkit-tap-highlight-color: none;
              -webkit-user-select: none;
              -ms-user-select: none;
              user-select: none;
              text-size-adjust: none;
          }

          .${gameRootClass} {
            overflow: hidden;
            position: relative;
          }

          .${gameLoggerClass} {
            z-index: 4;
            position: fixed;
            top:0;
            right:0;
          }

          .${getClassName("message-stack")} {
              width: cacl(100vw - 40px);
              max-width: 300px;
              max-height: calc(50vh - 50px);
              min-width: 200px;
              min-height: 150px;
              position: absolute;
              top: 5px;
              right: 5px;
              padding: 5px;
              background-color: #0000007b;
              color: #fff;
              font-size: 0.8rem;

              display: flex;
              flex-direction: column;
          }

          .${getClassName("message-stack-heading")}{
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }

          .${getClassName("message-stack-content")}{
            flex: 1;
            width: 100%;
            overflow-x: hidden;
            overflow-y: auto;
          }


          .${getClassName("float-container")} {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          .${getClassName("float-container")} > div {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .${getClassName("ui-control")} {
            position: absolute;
            display: inline-flex;
          }

          .${getClassName("scaler-container")} {
            width: 100%;
            height: 100%;
            position: relative;
            top: 0;
            left: 0;
          }

          .${getClassName("scaler-container")} > div {
            transform-origin: left top;
            position: relative;
            top: 50%;
            left: 50%;
          }
    `)
    );
  }, []);

  return (
    <>
      <SceneRunner
        key={currentScene.sessionId}
        current={currentScene}
        {...props}
      />
      {logPopup && <Logger />}
    </>
  );
}
