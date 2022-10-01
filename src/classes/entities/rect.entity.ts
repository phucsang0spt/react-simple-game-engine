import { Bodies, Body } from "matter-js";

import { CreateBodyDefine, EntityInitial, Point } from "../../export-types";
import { copyProperties } from "../../utils";
import { Entity } from "./entity";

export class RectEntity<P extends Record<string, any> = any> extends Entity<P> {
  public width: number;
  public height: number;

  get edge() {
    const { position, width, height } = this;
    const left = position.x - width / 2;
    const right = position.x + width / 2;
    const top = position.y - height / 2;
    const bottom = position.y + height / 2;
    return { left, right, top, bottom };
  }

  getSpriteWidthHeight(): { width: number; height: number } {
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
    enabledPhysicBody: boolean,
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
  ): Body | { position: Point } {
    copyProperties(this, transform);
    if (enabledPhysicBody) {
      return Bodies.rectangle(x!, y!, this.width, this.height, options);
    }
    return {
      position: {
        x,
        y,
      },
    };
  }
}
