import { Bodies, Body } from "matter-js";

import { CreateBodyDefine, EntityInitial } from "../../export-types";
import { Sprite } from "../sprites/sprite";
import { Entity } from "./entity";

export class RectEntity<
  SpriteType extends Sprite<any> = any
> extends Entity<SpriteType> {
  public width!: number;
  public height!: number;

  onSpriteWidthHeightBinding(): { width: number; height: number } {
    return {
      width: this.width,
      height: this.height,
    };
  }

  protected onInitial(): EntityInitial<RectEntity> {
    return {
      transform: {
        width: 10,
        height: 10,
      },
    };
  }

  protected onCreateBody(
    transform: CreateBodyDefine["transform"] & {
      width: number;
      height: number;
    },
    options?: CreateBodyDefine["bodyOptions"]
  ): Body {
    this.width = transform.width;
    this.height = transform.height;
    return Bodies.rectangle(
      transform.x!,
      transform.y!,
      transform.width,
      transform.height,
      options
    );
  }
}
