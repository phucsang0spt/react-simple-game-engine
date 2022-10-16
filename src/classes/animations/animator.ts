import { Initializer } from "../../export-interfaces";
import { Avatar } from "../../export-types";
import { copyProperties } from "../../utils";
import { Sprite } from "../sprites/sprite";
import { AnimationSprite } from "./animation";
import { AvatarAnimationSprite } from "./avatar.animation";

type AnimatorInitialParams = {
  activeKey: any;
  states: Record<any, AnimationSprite>;
};

export class Animator implements Initializer<AnimatorInitialParams> {
  private states: Record<any, AnimationSprite>;
  private activeKey: any;

  initial(params: AnimatorInitialParams) {
    copyProperties(this, params);
  }

  linkSprite(sprite: Sprite<any>) {
    for (const key in this.states) {
      if (this.states.hasOwnProperty(key)) {
        const state = this.states[key];
        if (state instanceof AvatarAnimationSprite) {
          state.onGetSource = () => sprite.source as Avatar;
          state.onGetSize = () => ({
            width: sprite.width,
            height: sprite.height,
          });
        }
      }
    }
  }

  draw() {
    this.getActiveAnimation().draw();
  }

  getActiveAnimation() {
    return this.states[this.activeKey];
  }

  set state(k: any) {
    this.activeKey = k;
  }

  get state() {
    return this.activeKey;
  }
}
