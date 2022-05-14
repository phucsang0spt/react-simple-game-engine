import { ColorSprite } from "../sprites/color.sprite";
import { AnimationSprite } from "./animation";

export class ColorAnimationSprite extends AnimationSprite<ColorSprite> {
  private colors!: ColorSprite["sprite"][];
  initial(colors: ColorSprite["sprite"][]) {
    this.colors = colors;
  }

  protected checkFrameMax(): boolean {
    return this.currentFrame >= this.colors.length;
  }

  protected onDraw(): void {
    Renderer.fill(...this.colors[this.currentFrame]);
  }
}
