import { AvatarSprite } from "../sprites/avatar.sprite";
import { AnimationSprite } from "./animation";

type Offset = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class AvatarAnimationSprite extends AnimationSprite<AvatarSprite> {
  private offset!: Offset;

  initial({ x = 0, y = 0, width = 0, height = 0 }: Partial<Offset>) {
    this.offset = {
      x,
      y,
      width,
      height,
    };
  }

  protected checkFrameMax(): boolean {
    const { width, x } = this.offset;
    return this.currentFrame * width + x >= this.sprite.source!.width;
  }

  onDraw() {
    const { x, y, width, height } = this.offset;
    Renderer.image(
      this.sprite.source!,
      // position on canvas
      0,
      0,
      this.sprite.width,
      this.sprite.height,
      //crop on source image
      this.currentFrame * width + x,
      y,
      width,
      height
    );
  }
}
