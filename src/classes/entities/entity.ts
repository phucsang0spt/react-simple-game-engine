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

type TimerJobListener = () => void;

export abstract class Entity<
  P extends Record<string, any> = Record<string, any>
> extends EntitySult<EntityInitial<Entity>> {
  private _body!: MasterBody;
  private _sprite!: Sprite<any>;
  private _children: EntitySult[] = [];
  private _props: Partial<P> = {};
  private timerJobListeners: Record<
    string,
    {
      timeCounter: number;
      interval: number;
      job: TimerJobListener;
      defaultRun: boolean;
    }
  > = {};

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

  /**
   * @param {string} name
   * @param {number} interval in seconds
   * @param {TimerJobListener} job function that run per #interval
   * @void
   */
  onTimer(
    name: string,
    interval: number,
    job: TimerJobListener,
    defaultRun = false
  ) {
    if (!this.timerJobListeners[name]) {
      this.timerJobListeners[name] = {
        timeCounter: 0,
        interval,
        job,
        defaultRun,
      };
    } else {
      console.warn(`Job with name ${name} is already assigned`);
    }
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
    transform: CreateBodyDefine["transform"],
    options?: CreateBodyDefine["bodyOptions"]
  ): Matter.Body;

  initial({
    transform,
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
    for (const name in this.timerJobListeners) {
      let { timeCounter, interval, job, defaultRun } =
        this.timerJobListeners[name];
      if (defaultRun || timeCounter / 1000 >= interval) {
        timeCounter = 0;
        job();
        this.timerJobListeners[name].defaultRun = false;
      }
      timeCounter += Renderer.deltaTime;

      this.timerJobListeners[name].timeCounter = timeCounter;
    }
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
