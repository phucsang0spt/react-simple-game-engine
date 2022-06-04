import Matter, { Bodies, Body } from "matter-js";

import { Sprite } from "../sprites/sprite";
import { ColorSprite } from "../sprites/color.sprite";

import {
  CreateBodyDefine,
  EntityInitial,
  EntityPrepare,
  MasterBody,
} from "../../export-types";
import { EntitySult } from "./entity-sult";
import { LogicComponent } from "../logic-component";
import { copyProperties } from "../../utils";
import { Sound } from "../sound";

type TimerJobListener = () => void;

type TerminateOptions = {
  duration?: number;
  effect: EntitySult | LogicComponent<EntitySult>;
};

export abstract class Entity<
  P extends Record<string, any> = Record<string, any>
> extends EntitySult<EntityInitial<Entity>> {
  private _body!: MasterBody;
  private _sprite!: Sprite<any>;
  private _props: Partial<P> = {};
  private timerJobListeners: {
    timeCounter: number;
    interval: number;
    job: TimerJobListener;
    defaultRun: boolean;
  }[] = [];
  private isTerminate = false;

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

  get props() {
    return this._props as P;
  }

  /**
   * @param {TerminateOptions} options
   * #duration: time to disappear from the world in seconds, default: 0.2 seconds
   * #effect: effect to showing on duration time
   * @void
   */
  terminate(options?: TerminateOptions) {
    if (options) {
      const { duration = 0.2, effect } = options;
      this.isTerminate = true;
      Body.setVelocity(this.body, {
        y: 0,
        x: 0,
      });
      this.addChild(effect);

      setTimeout(() => {
        this.worldManagement.removeEntity(this);
      }, duration * 1000);
    } else {
      this.worldManagement.removeEntity(this);
    }
  }

  /**
   * @param {number} interval in seconds
   * @param {TimerJobListener} job function that run per #interval
   * @void
   */
  onTimer(
    interval: number,
    job: TimerJobListener,
    defaultRun = false
  ): () => void {
    const listener = {
      timeCounter: 0,
      interval,
      job,
      defaultRun,
    };
    this.timerJobListeners.push(listener);

    return () => {
      const index = this.timerJobListeners.indexOf(listener);
      if (index > -1) {
        this.timerJobListeners.splice(index, 1);
      }
    };
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
    if (!this.isTerminate) {
      this.onUpdate();
    }
    for (const jobListener of this.timerJobListeners) {
      let { timeCounter, interval, job, defaultRun } = jobListener;
      if (defaultRun || timeCounter / 1000 >= interval) {
        timeCounter = 0;
        job();
        jobListener.defaultRun = false;
      }
      timeCounter += Renderer.deltaTime;
      jobListener.timeCounter = timeCounter;
    }
  }
  onUpdate() {}

  draw() {
    if (!this.isTerminate) {
      this.sprite.draw();
    }
  }

  abstract onSpriteWidthHeightBinding(): { width: number; height: number };

  onCollision(target: Entity) {}
  onCollisionEnd(target: Entity) {}
  onCollisionActive(target: Entity) {}
}
