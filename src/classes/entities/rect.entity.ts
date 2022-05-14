import { Bodies, Body } from "matter-js";
import { CreateBodyDefine, EntityInitial } from "../../export-types";
import { Entity } from "./entity";

export class RectEntity extends Entity {
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
