import { ReactNode, useEffect, useState } from "react";
import { Scene } from "./scene";

type WatcherProps<IV> = {
  scene: Scene;
  names: string | string[];
  initialValues: IV;
  children: (value: IV) => ReactNode;
};
export function Watcher<IV extends Record<string, any> = Record<string, any>>({
  scene,
  names: _names,
  children,
  initialValues,
}: WatcherProps<IV>) {
  const names = Array.isArray(_names) ? _names : [_names];

  const [values, setValues] = useState<IV>(initialValues);

  useEffect(() => {
    const unsubs = names.map((name) =>
      scene.onEntityPropsChangeListener(name, (value) => {
        setValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      })
    );
    return () => {
      for (const unsub of unsubs) {
        unsub();
      }
    };
  }, [...names, scene]);
  return <>{children(values)}</>;
}
