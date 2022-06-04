import { ReactNode, useEffect, useState } from "react";
import { SoundType } from "../export-enums";
import { SoundManagement } from "../export-types";
import { Scene } from "./scene";

type SoundOnceWatcherProps = {
  scene: Scene;
  children: (value: SoundManagement[SoundType.ONCE]) => ReactNode;
};
export function SoundOnceWatcher({ scene, children }: SoundOnceWatcherProps) {
  const [values, setValues] = useState(scene.soundOnceOptions);
  useEffect(() => {
    return scene.onSoundOnceOptionsChange((options) => {
      setValues({ ...options });
    });
  }, [scene]);

  return <>{children(values)}</>;
}

type SoundBackgroundWatcherProps = {
  scene: Scene;
  children: (value: SoundManagement[SoundType.BACKGROUND]) => ReactNode;
};
export function SoundBackgroundWatcher({
  scene,
  children,
}: SoundBackgroundWatcherProps) {
  const [values, setValues] = useState(scene.soundBackgroundOptions);

  useEffect(() => {
    return scene.onSoundBackgroundOptionsChange((options) => {
      setValues({ ...options });
    });
  }, [scene]);

  return <>{children(values)}</>;
}
