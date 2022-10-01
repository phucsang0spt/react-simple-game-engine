import { createContext } from "react";
import { Scene } from "./classes/scene";

export const UISceneContext = createContext<Scene<any>>(null);
