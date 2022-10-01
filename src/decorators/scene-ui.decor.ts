import { ComponentType } from "react";
import { Scene } from "../classes/scene";

export function SceneUI(ui: ComponentType<any>) {
  return function (target: { ui?: ComponentType<any>; new (): Scene }) {
    target.ui = ui;
  };
}
