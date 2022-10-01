import { Initialler } from "../../export-interfaces";
import { copyProperties } from "../../utils";
import { Sprite } from "../sprites/sprite";
import { AnimationSprite } from "./animation";

type AnimatorInitialParams<O extends Sprite<any> = Sprite<any>> = {
  activeKey: any;
  states: Record<any, AnimationSprite<O>>;
};

export class Animator<O extends Sprite<any> = Sprite<any>>
  implements Initialler<AnimatorInitialParams<O>>
{
  private states: Record<any, AnimationSprite<O>>;
  private activeKey: any;

  initial(params: AnimatorInitialParams<O>) {
    copyProperties(this, params);
  }

  linkSprite(sprite: Sprite<any>) {
    for (const key in this.states) {
      if (this.states.hasOwnProperty(key)) {
        const state = this.states[key];
        //@ts-ignore,pass check modifier for first initial
        state._sprite = sprite;
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
