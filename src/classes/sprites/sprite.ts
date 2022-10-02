import { Body } from "matter-js";
import { Avatar, Color } from "../../export-types";
import { AnimationSprite } from "../animations/animation";
import { Animator } from "../animations/animator";
import { AvatarAnimationSprite } from "../animations/avatar.animation";
import { Entity } from "../entities/entity";
import { LogicComponent } from "../logic-component";

export type SourceType = Avatar | Color | undefined | null;

export type GetInitialParams<S extends Sprite<any> = any> = {
  source?: S["source"];
  animation?: LogicComponent<AnimationSprite> | LogicComponent<Animator>;
};

export abstract class Sprite<SpriteType extends SourceType> {
  public source: SpriteType;
  private _entity: Entity;
  private _width: number;
  private _height: number;

  private _animation?: AnimationSprite | Animator;

  set animation(ani: AnimationSprite | Animator) {
    this._animation = ani;
    if (ani instanceof Animator) {
      ani.linkSprite(this);
    } else {
      if (this._animation instanceof AvatarAnimationSprite) {
        this._animation.onGetSource = () => this.source as Avatar;
        this._animation.onGetSize = () => ({
          width: this._width,
          height: this._height,
        });
      }
    }
  }

  get animation(): AnimationSprite {
    return this._animation as AnimationSprite;
  }

  get animator(): Animator {
    return this._animation as Animator;
  }

  set entity(entity: Entity) {
    this._entity = entity;
    const { width, height } = entity.getSpriteWidthHeight();
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
    const { body, position, havePhysicBody } = this.entity;

    Renderer.drawHandle(position, () => {
      if (havePhysicBody) {
        Renderer.rotate(body.angle);
      }
      this.onDraw();
    });
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
