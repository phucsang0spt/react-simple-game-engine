import { Body, Bodies } from "matter-js";

import { CreateBodyDefine, EntityInitial } from "../../export-types";
import { copyProperties } from "../../utils";
import { Entity } from "./entity";

export class CircleEntity<
  P extends Record<string, any> = Record<string, any>
> extends Entity<P> {
  public radius!: number;

  onSpriteWidthHeightBinding(): { width: number; height: number } {
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
    {
      x,
      y,
      ...transform
    }: NonNullable<CreateBodyDefine<{ radius: number }>["transform"]>,
    options?: CreateBodyDefine["bodyOptions"]
  ): Body {
    copyProperties(this, transform);
    return Bodies.circle(x!, y!, this.radius, options);
  }
}
