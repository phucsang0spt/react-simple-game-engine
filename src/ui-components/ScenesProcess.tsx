import { useEffect, useMemo, useState } from "react";

import { SceneManagement } from "../classes/scene-management";
import { SceneRunner, SceneRunnerPublicProps } from "./SceneRunner";

type WorldViewProps = SceneRunnerPublicProps & {
  list: ConstructorParameters<typeof SceneManagement>[0];
};

export function ScenesProcess({ list, ...props }: WorldViewProps) {
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
      {...props}
    />
  );
}
