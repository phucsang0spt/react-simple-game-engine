import { Body, Bodies } from "matter-js";

import { CreateBodyDefine, EntityInitial, Point } from "../../export-types";
import { copyProperties } from "../../utils";
import { Entity } from "./entity";

export class CircleEntity<
  P extends Record<string, any> = Record<string, any>
> extends Entity<P> {
  public radius: number;

  get edge() {
    const { position, radius } = this;
    const left = position.x - radius;
    const right = position.x + radius;
    const top = position.y - radius;
    const bottom = position.y + radius;
    return { left, right, top, bottom };
  }

  getSpriteWidthHeight(): { width: number; height: number } {
    return {
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  protected onInitial(): EntityInitial<this> {
    return {
      transform: {
        radius: 1,
      },
    };
  }

  protected onCreateBody(
    enabledPhysicBody: boolean,
    {
      x,
      y,
      ...transform
    }: NonNullable<CreateBodyDefine<{ radius: number }>["transform"]>,
    options?: CreateBodyDefine["bodyOptions"]
  ): Body | { position: Point } {
    copyProperties(this, transform);
    if (enabledPhysicBody) {
      return Bodies.circle(x!, y!, this.radius, options);
    }
    return {
      position: {
        x,
        y,
      },
    };
  }
}
