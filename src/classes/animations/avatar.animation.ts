import { AnimationInitialParams } from "../../export-types";
import { copyProperties } from "../../utils";
import { AvatarSprite } from "../sprites/avatar.sprite";
import { AnimationSprite } from "./animation";

type Offset = {
  x: number;
  y: number;
  width: number;
  height: number;
  distancePerFrame?: number;
  maxFrame?: number;
};

export class AvatarAnimationSprite extends AnimationSprite<AvatarSprite> {
  private offset: Offset;

  initial({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    distancePerFrame = 0,
    maxFrame,
    ...params
  }: AnimationInitialParams<Partial<Offset>>) {
    this.offset = {
      x,
      y,
      width,
      height,
      distancePerFrame,
      maxFrame,
    };
    copyProperties(this, params);
  }

  protected checkFrameMax(): boolean {
    const { width, x, distancePerFrame, maxFrame } = this.offset;
    if (maxFrame != null) {
      return this.currentFrame === maxFrame;
    }
    
    return (
      x + this.currentFrame * (width + distancePerFrame) >=
      this.sprite.source!.width
    );
  }

  onDraw() {
    const { x, y, width, height, distancePerFrame } = this.offset;
    Renderer.image(
      this.sprite.source!,
      // position on canvas
      0,
      0,
      this.sprite.width,
      this.sprite.height,
      //crop on source image
      x + this.currentFrame * (width + distancePerFrame),
      y,
      width,
      height
    );
  }
}
