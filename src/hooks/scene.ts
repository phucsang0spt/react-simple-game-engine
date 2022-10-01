import { useContext } from "react";
import { UISceneContext } from "../react-context";

export function useScene() {
  const scene = useContext(UISceneContext);

  return scene;
}
