import { createContext } from "react";
import { Scaler } from "./classes/scaler";
import { Scene } from "./classes/scene";

export const UISceneContext = createContext<Scene<any>>(null);
export const ScalerContext = createContext<Scaler>(null);
