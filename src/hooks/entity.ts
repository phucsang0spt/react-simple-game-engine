import { useContext, useMemo } from "react";
import { EntitySuit } from "../classes/entities/entity-suit";
import { UISceneContext } from "../react-context";

type TargetFind<T> =
  | string
  | {
      new (): T;
    };

export function useEntity<T extends EntitySuit = EntitySuit>(
  ...entityClasses: TargetFind<T>[]
) {
  const scene = useContext(UISceneContext);

  return useMemo(() => {
    return entityClasses.map((cls) => scene.worldManagement.getEntity(cls));
  }, [scene]);
}
