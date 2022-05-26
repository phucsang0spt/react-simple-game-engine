import { Bodies, Body } from "matter-js";

import { CreateBodyDefine, EntityInitial } from "../../export-types";
import { copyProperties } from "../../utils";
import { Entity } from "./entity";

export class RectEntity<P extends Record<string, any> = any> extends Entity<P> {
  public width!: number;
  public height!: number;

  onSpriteWidthHeightBinding(): { width: number; height: number } {
    return {
      width: this.width,
      height: this.height,
    };
  }

  protected onInitial(): EntityInitial<this> {
    return {
      transform: {
        width: 1,
        height: 1,
      },
    };
  }

  protected onCreateBody(
    {
      x,
      y,
      ...transform
    }: NonNullable<
      CreateBodyDefine<{
        width?: number;
        height?: number;
      }>["transform"]
    >,
    options?: CreateBodyDefine["bodyOptions"]
  ): Body {
    copyProperties(this, transform);
    return Bodies.rectangle(x!, y!, this.width, this.height, options);
  }
}
