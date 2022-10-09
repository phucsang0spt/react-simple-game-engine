import { useContext, useEffect, useState } from "react";
import { UISceneContext } from "../react-context";

export function useWatcher<
  IV extends Record<string, any> = Record<string, any>
>(name: string | string[], initialValues: IV) {
  const scene = useContext(UISceneContext);

  const names = Array.isArray(name) ? name : [name];
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

  return values;
}
