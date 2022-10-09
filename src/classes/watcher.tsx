import { ReactNode, useContext, useEffect, useState } from "react";
import { UISceneContext } from "../react-context";

type WatcherProps<IV> = {
  names: string | string[];
  initialValues: IV;
  children: (value: IV) => ReactNode;
};
export function Watcher<IV extends Record<string, any> = Record<string, any>>({
  names: _names,
  children,
  initialValues,
}: WatcherProps<IV>) {
  const scene = useContext(UISceneContext);
  const names = Array.isArray(_names) ? _names : [_names];

  const [values, setValues] = useState<IV>(initialValues);

  useEffect(() => {
    const unSubs = names.map((name) =>
      scene.onEntityPropsChange(name, (value) => {
        setValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      })
    );
    return () => {
      for (const unSub of unSubs) {
        unSub();
      }
    };
  }, [...names, scene]);
  return <>{children(values)}</>;
}
