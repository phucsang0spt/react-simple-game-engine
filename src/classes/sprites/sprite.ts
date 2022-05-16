import { Avatar, Color } from "../../export-types";
import { AnimationSprite } from "../animations/animation";
import { Entity } from "../entities/entity";
import { LogicComponent } from "../logic-component";

export type SourceType = Avatar | Color | undefined | null;

export type GetInitialParams<S extends Sprite<any> = any> = {
  source?: S["source"];
  animation?: LogicComponent<AnimationSprite<S>>;
};

export abstract class Sprite<SpriteType extends SourceType> {
  public source!: SpriteType;
  private _entity!: Entity;
  private _width!: number;
  private _height!: number;

  private _animation: AnimationSprite<this> | undefined;

  set animation(ani: AnimationSprite<this>) {
    this._animation = ani;
    this._animation.sprite = this;
  }

  get animation(): AnimationSprite<this> {
    return this._animation as any;
  }

  set entity(entity: Entity) {
    this._entity = entity;
    const { width, height } = this._entity.onSpriteWidthHeightBinding();
    this._width = width;
    this._height = height;
  }

  get entity() {
    return this._entity;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  draw() {
    const { body, position, camera } = this.entity;
    Renderer.push();
    Renderer.noStroke();
    Renderer.translate(position.x - camera.x, position.y - camera.y);
    Renderer.rotate(body.angle);
    this.onDraw();
    Renderer.pop();
  }

  abstract onDraw(): void;

  initial(params?: GetInitialParams<this>) {
    if (params) {
      for (const key in params) {
        // @ts-ignore
        const P = params[key];
        if (P instanceof LogicComponent) {
          // @ts-ignore
          this[key] = P.output();
        } else {
          // @ts-ignore
          this[key] = P;
        }
      }
    }
  }
}
