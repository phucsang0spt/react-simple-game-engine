import { Scene } from "../classes/scene";

export function SceneTag(tag: string) {
  return function (target: { tag?: string; new (): Scene }) {
    target.tag = tag;
  };
}
