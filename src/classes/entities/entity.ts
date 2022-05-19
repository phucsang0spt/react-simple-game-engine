import Matter from "matter-js";

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

export abstract class Entity extends EntitySult<EntityInitial<Entity>> {
  private _body!: MasterBody;
  private _sprite!: Sprite<any>;
  private _children: EntitySult[] = [];

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

  addChild(target: EntitySult | LogicComponent<EntitySult>) {
    const entity = target instanceof EntitySult ? target : target.output();
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
    sound,
    transform = {},
    sprite: spriteComponent,
    bodyOptions = {},
  }: EntityInitial<this>) {
    const {
      transform: { x = 0, y = 0, ...dfTransform } = {},
      bodyOptions: dfBodyOptions,
      sprite: dfSpriteComponent,
    } = this.onInitial();

    const {
      transform: transformAlt,
      bodyOptions: bodyOptionsAlt,
      sprite: spriteComponentAlt,
    } = this.onPrepare();

    this.createBody(
      { x, y, ...dfTransform, ...transform, ...transformAlt },
      {
        ...dfBodyOptions,
        ...bodyOptions,
        ...bodyOptionsAlt,
      }
    );

    this.sound = sound;

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
