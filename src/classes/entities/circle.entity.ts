import { Body, Bodies } from "matter-js";

import { CreateBodyDefine, EntityInitial } from "../../export-types";
import { Sprite } from "../sprites/sprite";
import { Entity } from "./entity";

export class CircleEntity<
  SpriteType extends Sprite<any> = any
> extends Entity<SpriteType> {
  public radius!: number;

  onSpriteWidthHeightBinding(): { width: number; height: number } {
    return {
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  protected onInitial(): EntityInitial<CircleEntity> {
    return {
      transform: {
        radius: 5,
      },
    };
  }

  protected onCreateBody(
    transform: CreateBodyDefine["transform"] & { radius: number },
    options?: CreateBodyDefine["bodyOptions"]
  ): Body {
    this.radius = transform.radius;
    return Bodies.circle(transform.x!, transform.y!, transform.radius, options);
  }
}
