import { AnimationInitialParams, Avatar, Size } from "../../export-types";
import { copyProperties } from "../../utils";
import { AnimationSprite } from "./animation";

type Offset = {
  x: number;
  y: number;
  width: number;
  height: number;
  distancePerFrame?: number;
  maxFrame?: number;
};

export class AvatarAnimationSprite extends AnimationSprite {
  private offset: Offset;

  source: Avatar;
  size: Size;

  onGetSource: () => Avatar;
  onGetSize: () => Size;

  getSource() {
    if (this.source) {
      return this.source;
    }
    this.source = this.onGetSource();
    return this.source;
  }
  getSize() {
    if (this.size) {
      return this.size;
    }
    this.size = this.onGetSize();
    return this.size;
  }

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
      this.getSource().width
    );
  }

  onDraw() {
    const { x, y, width, height, distancePerFrame } = this.offset;
    const size = this.getSize();
    Renderer.image(
      this.getSource(),
      // position on canvas
      0,
      0,
      size.width,
      size.height,
      //crop on source image
      x + this.currentFrame * (width + distancePerFrame),
      y,
      width,
      height
    );
  }
}
