import { useContext, useMemo } from "react";
import { EntitySult } from "../classes/entities/entity-sult";
import { UISceneContext } from "../react-context";

type TargetFind<T> =
  | string
  | {
      new (): T;
    };

export function useEntity<T extends EntitySult = EntitySult>(
  ...entityClasses: TargetFind<T>[]
) {
  const scene = useContext(UISceneContext);

  return useMemo(() => {
    return entityClasses.map((cls) => scene.worldManagement.getEntity(cls));
  }, [scene]);
}
