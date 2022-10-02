import { copyProperties } from "../../utils";
import { ColorSprite } from "../sprites/color.sprite";
import { AnimationSprite } from "./animation";

export class ColorAnimationSprite extends AnimationSprite {
  private colors: ColorSprite["source"][];
  private maxFrame?: number;

  initial(params: { colors: ColorSprite["source"][]; maxFrame?: number }) {
    copyProperties(this, params);
  }

  protected checkFrameMax(): boolean {
    if (this.maxFrame != null) {
      return this.currentFrame === this.maxFrame;
    }

    return this.currentFrame >= this.colors.length;
  }

  protected onDraw(): void {
    Renderer.fill(...this.colors[this.currentFrame]);
  }
}
