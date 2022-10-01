import Matter, { Bodies, Body } from "matter-js";

import { Sprite } from "../sprites/sprite";
import { ColorSprite } from "../sprites/color.sprite";

import {
  CreateBodyDefine,
  EntityInitial,
  EntityPrepare,
  MasterBody,
  Point,
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

type TimerOptions = {
  defaultRun?: boolean;
  once?: boolean;
  startFrom?: number;
  onRegisterDone?: (time: number) => void;
};

export abstract class Entity<
  P extends Record<string, any> = Record<string, any>
> extends EntitySult<EntityInitial<Entity>> {
  private _body: MasterBody | { position: Point; entity: Entity };
  private _sprite: Sprite<any>;
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

  abstract get edge(): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };

  set sprite(sprite: Sprite<any>) {
    this._sprite = sprite;
    this._sprite.entity = this;
  }

  get sprite() {
    return this._sprite;
  }

  get position() {
    return this._body.position as Matter.Vector;
  }

  get body() {
    return this._body as MasterBody;
  }

  get props() {
    return this._props as P;
  }

  get havePhysicBody() {
    const body = this._body as MasterBody;
    return body.id != null && !!body.force;
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
      if (this.havePhysicBody) {
        Body.setVelocity(this.body, {
          y: 0,
          x: 0,
        });
      }

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
   * @param {TimerOptions} options
   * @void
   */
  onTimer(
    interval: number,
    job: TimerJobListener,
    {
      defaultRun = false,
      once = false,
      startFrom,
      onRegisterDone,
    }: TimerOptions = {}
  ): () => void {
    const listener = {
      timeCounter: startFrom != null ? new Date().getTime() - startFrom : 0,
      interval,
      job,
      defaultRun,
    };
    this.timerJobListeners.push(listener);

    const unsub = () => {
      const index = this.timerJobListeners.indexOf(listener);
      if (index > -1) {
        this.timerJobListeners.splice(index, 1);
      }
    };

    if (once) {
      listener.job = () => {
        job();
        unsub();
      };
    }

    if (onRegisterDone) {
      onRegisterDone(startFrom ?? new Date().getTime()); //todo: this may not invoke correctly
    }
    return unsub;
  }

  createBody(
    enabledPhysicBody: boolean,
    transform: CreateBodyDefine["transform"],
    options?: CreateBodyDefine["bodyOptions"]
  ) {
    this._body = this.onCreateBody(
      enabledPhysicBody,
      transform,
      options
    ) as MasterBody;
    this._body.entity = this;
    return this._body;
  }

  protected abstract onCreateBody(
    enabledPhysicBody: boolean,
    transform: CreateBodyDefine["transform"],
    options?: CreateBodyDefine["bodyOptions"]
  ): Matter.Body | { position: Point };

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
      enabledPhysicBody = true,
      ...paramsAlt
    } = this.onPrepare();

    this.createBody(
      enabledPhysicBody,
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

  /**
   * invoke before entity setup completed, this is need to provide infomation of name, sprite, animation, animator, transform,...
   * @void
   */
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

  /**
   * invoke in every frame, this is necessary for logic that need to run in every frame
   * @void
   */
  onUpdate() {}

  draw() {
    if (!this.isTerminate) {
      this.sprite.draw();
    }
  }

  abstract getSpriteWidthHeight(): { width: number; height: number };

  onCollision(target: Entity) {}
  onCollisionEnd(target: Entity) {}
  onCollisionActive(target: Entity) {}
}
