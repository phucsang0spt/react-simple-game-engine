import Matter, { Bodies, Body } from "matter-js";

import { Sprite } from "../sprites/sprite";
import { ColorSprite } from "../sprites/color.sprite";

import {
  CreateBodyDefine,
  EntityInitial,
  EntityPrepare,
  MasterBody,
  Sound,
} from "../../export-types";
import { EntitySult } from "./entity-sult";
import { LogicComponent } from "../logic-component";
import { copyProperties } from "../../utils";

export abstract class Entity<
  P extends Record<string, any> = Record<string, any>
> extends EntitySult<EntityInitial<Entity>> {
  private _body!: MasterBody;
  private _sprite!: Sprite<any>;
  private _children: EntitySult[] = [];
  private _props: Partial<P> = {};

  public enabledGravity: boolean = true;
  public sound?: Sound;

  set sprite(sprite: Sprite<any>) {
    this._sprite = sprite;
    this._sprite.entity = this;
  }

  get sprite() {
    return this._sprite;
  }

  get position() {
    return this._body.position;
  }

  get body() {
    return this._body;
  }

  get children() {
    return this._children;
  }

  get props() {
    return this._props as P;
  }

  addChild(target: EntitySult | LogicComponent<EntitySult>) {
    const entity =
      target instanceof EntitySult
        ? target
        : target.output({ worldManagement: this.worldManagement });
    this.children.push(entity);
    this.worldManagement.addEntity(entity);
  }

  removeChild(entity: EntitySult) {
    const delIndex = this.children.indexOf(entity);
    if (delIndex > -1) {
      this.children.splice(delIndex, 1);
      this.worldManagement.removeEntity(entity);
    }
  }

  createBody(
    transform: CreateBodyDefine["transform"],
    options?: CreateBodyDefine["bodyOptions"]
  ) {
    this._body = this.onCreateBody(transform, options) as MasterBody;
    this._body.entity = this;
    return this._body;
  }

  protected abstract onCreateBody(
    transform: CreateBodyDefine["transform"] | undefined,
    options?: CreateBodyDefine["bodyOptions"]
  ): Matter.Body;

  initial({
    transform = {},
    sprite: spriteComponent,
    bodyOptions,
    props = {},
    ...params
  }: EntityInitial<this>) {
    const {
      transform: { x = 0, y = 0, ...dfTransform } = {},
      bodyOptions: dfBodyOptions,
      sprite: dfSpriteComponent,
      props: dfProps = {},
      ...dfParams
    } = this.onInitial();

    copyProperties(this._props, {
      ...dfProps,
      ...props,
    });

    const {
      transform: transformAlt,
      bodyOptions: bodyOptionsAlt,
      sprite: spriteComponentAlt,
      props: propsAlt = {},
      ...paramsAlt
    } = this.onPrepare();

    this.createBody(
      { x, y, ...dfTransform, ...transform, ...transformAlt },
      {
        ...dfBodyOptions,
        ...bodyOptions,
        ...bodyOptionsAlt,
      }
    );

    copyProperties(this._props, {
      ...propsAlt,
    });

    copyProperties(this, {
      ...dfParams,
      ...params,
      ...paramsAlt,
    });

    //@ts-ignore
    this.sprite =
      dfSpriteComponent?.output() ||
      spriteComponent?.output() ||
      spriteComponentAlt?.output() ||
      new ColorSprite();
  }

  protected abstract onInitial(): EntityInitial<this>;
  protected onPrepare(): EntityPrepare<this> {
    return {};
  }

  update() {
    this.onUpdate();
  }
  onUpdate() {}

  draw() {
    this.sprite.draw();
  }

  abstract onSpriteWidthHeightBinding(): { width: number; height: number };

  onCollision(target: Entity) {}
  onCollisionEnd(target: Entity) {}
  onCollisionActive(target: Entity) {}
}
