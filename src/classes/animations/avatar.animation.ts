import { AvatarSprite } from "../sprites/avatar.sprite";
import { AnimationSprite } from "./animation";

export class AvatarAnimationSprite extends AnimationSprite<AvatarSprite> {
  private options!: {
    offsetX: number;
    offsetY: number;
    offsetWidth: number;
    offsetHeight: number;
  };

  initial({
    offsetX = 0,
    offsetY = 0,
    ...options
  }: {
    offsetX?: number;
    offsetY?: number;
    offsetWidth: number;
    offsetHeight: number;
  }) {
    this.options = {
      offsetX,
      offsetY,
      ...options,
    };
  }

  protected checkFrameMax(): boolean {
    const { offsetWidth, offsetX } = this.options;
    return (
      this.currentFrame * offsetWidth + offsetX >= this.source.sprite!.width
    );
  }

  onDraw() {
    const source = this.source;
    const { offsetWidth, offsetHeight, offsetX, offsetY } = this.options;
    Renderer.image(
      source.sprite!,
      // position on canvas
      0,
      0,
      source.width,
      source.height,
      //crop on source image
      this.currentFrame * offsetWidth + offsetX,
      offsetY,
      offsetWidth,
      offsetHeight
    );
  }
}
