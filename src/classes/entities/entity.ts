import Matter from "matter-js";

import { Camera } from "../camera";
import { WorldManagement } from "../world-management";

import { Sprite } from "../sprites/sprite";
import { ColorSprite } from "../sprites/color.sprite";

import {
  CreateBodyDefine,
  EntityInitial,
  EntityPrepare,
  MasterBody,
  Sound,
} from "../../export-types";

export abstract class Entity<SpriteType extends Sprite<any> = any> {
  private _body!: MasterBody;
  private _sprite!: SpriteType;
  private readonly id: string = `${Math.random()}-${new Date().getTime()}`;

  public readonly tag!: string;
  public camera!: Camera;

  protected worldManagement!: WorldManagement;
  protected sound?: Sound;

  constructor() {
    this.tag = (this as any).constructor.tag;
  }

  set sprite(sprite: SpriteType) {
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

  active(worldManagement: WorldManagement) {
    console.log(`Initted ${this.tag} entity (id : ${this.id})`);
    this.worldManagement = worldManagement;
    this.onActive();
  }
  onActive() {}

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
