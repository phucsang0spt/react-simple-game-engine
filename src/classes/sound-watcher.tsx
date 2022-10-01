import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { SoundStoreKey, SoundType } from "../export-enums";
import { SoundManagement } from "../export-types";
import { UISceneContext } from "../react-context";
import { Saver } from "./saver";

type SoundWatcherChildProps = {
  toggle: () => void;
  set: (on: boolean) => void;
};

type SoundOnceWatcherProps = {
  children: (
    value: SoundManagement[SoundType.ONCE] & SoundWatcherChildProps
  ) => ReactNode;
};

export function SoundOnceWatcher({ children }: SoundOnceWatcherProps) {
  const scene = useContext(UISceneContext);
  const [values, setValues] = useState(scene.soundOnceOptions);
  useEffect(() => {
    return scene.onSoundOnceOptionsChange((options) => {
      setValues((prev) => ({ ...prev, ...options }));
    });
  }, [scene]);

  const toggle = useCallback(() => {
    const next = !scene.soundOnceOptions.canPlay;
    scene.soundOnceOptions = {
      canPlay: next,
    };
    Saver.set(SoundStoreKey.ONCE, next);
  }, []);

  const set = useCallback((on: boolean) => {
    scene.soundOnceOptions = {
      canPlay: on,
    };
    Saver.set(SoundStoreKey.ONCE, on);
  }, []);

  return <>{children({ ...values, toggle, set })}</>;
}

type SoundBackgroundWatcherProps = {
  children: (
    value: SoundManagement[SoundType.BACKGROUND] & SoundWatcherChildProps
  ) => ReactNode;
};
export function SoundBackgroundWatcher({
  children,
}: SoundBackgroundWatcherProps) {
  const scene = useContext(UISceneContext);
  const [values, setValues] = useState(scene.soundBackgroundOptions);

  useEffect(() => {
    return scene.onSoundBackgroundOptionsChange((options) => {
      setValues((prev) => ({ ...prev, ...options }));
    });
  }, [scene]);

  const toggle = useCallback(() => {
    const next = !scene.soundBackgroundOptions.canPlay;
    scene.soundBackgroundOptions = {
      canPlay: next,
    };
    Saver.set(SoundStoreKey.BACKGROUND, next);
  }, []);

  const set = useCallback((on: boolean) => {
    scene.soundBackgroundOptions = {
      canPlay: on,
    };
    Saver.set(SoundStoreKey.BACKGROUND, on);
  }, []);

  return <>{children({ ...values, toggle, set })}</>;
}
