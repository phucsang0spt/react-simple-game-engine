import { Avatar } from "../../export-types";
import { copyProperties } from "../../utils";
import { GetInitialParams, Sprite } from "./sprite";

type SpriteOffset = {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
};

type AvatarGetInitialParams<S extends AvatarSprite> = GetInitialParams<S> & {
  //@ts-ignore
  offset?: Partial<SpriteOffset>;
};

export class AvatarSprite extends Sprite<Avatar | undefined | null> {
  private _offset: SpriteOffset = {
    x: 0,
    y: 0,
    index: 0,
    width: 0,
    height: 0,
  };

  get offset() {
    return this._offset;
  }

  onDraw() {
    if (this.source) {
      if (this.animation) {
        this.animation.draw();
      } else {
        const { x, y, width, height, index } = this._offset;
        Renderer.image(
          this.source,
          // position on canvas
          0,
          0,
          this.width,
          this.height,
          //crop on source image
          index * width + x,
          y,
          width,
          height
        );
      }
    }
  }

  initial(params?: AvatarGetInitialParams<this>) {
    const { offset, source, ..._params } = (params ||
      {}) as AvatarGetInitialParams<this>;

    if (source) {
      this._offset.width = source.width;
      this._offset.height = source.height;
    }
    if (offset) {
      copyProperties(this._offset, offset);
    }

    super.initial({ ..._params, source });
  }
}
