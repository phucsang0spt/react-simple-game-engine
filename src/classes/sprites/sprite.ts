import { AnimationSprite } from "../animations/animation";
import { Entity } from "../entities/entity";
import { LogicComponent } from "../logic-component";

export type GetInitialParams<S extends { sprite?: any } = any> = {
  sprite?: S["sprite"];
  animation?: LogicComponent<AnimationSprite>;
};

export abstract class Sprite<SpriteType = any> {
  public sprite!: SpriteType;
  private _entity!: Entity;
  private _width!: number;
  private _height!: number;

  private _animation: AnimationSprite | undefined;

  set animation(ani: AnimationSprite) {
    this._animation = ani;
    this._animation.source = this;
  }

  get animation(): AnimationSprite {
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
