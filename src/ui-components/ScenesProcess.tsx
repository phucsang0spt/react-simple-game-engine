import { useEffect, useMemo, useState } from "react";

import { SceneManagement } from "../classes/scene-management";
import { SceneRunner } from "./SceneRunner";

type WorldViewProps = {
  list: ConstructorParameters<typeof SceneManagement>[0];
  width: number;
  height: number;
};

export function ScenesProcess({ list, width, height }: WorldViewProps) {
  const sceneManagement = useMemo(() => {
    return new SceneManagement(list);
  }, [list]);

  const [currentScene, setCurrentScene] = useState(
    sceneManagement.currentScene
  );
  const [, setLoadedAssets] = useState(currentScene.loadedAssets);

  useEffect(() => {
    sceneManagement.onChangeScene((scene) => {
      setCurrentScene(scene);
      setLoadedAssets(scene.loadedAssets);
    });
  }, [sceneManagement]);

  useEffect(() => {
    currentScene.onLoadAssetNotify((isLoaded) => {
      setLoadedAssets(isLoaded);
    });
  }, [currentScene]);

  return (
    <SceneRunner
      key={currentScene.sessionId}
      current={currentScene}
      width={width}
      height={height}
    />
  );
}
