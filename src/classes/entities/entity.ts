import Matter, { Bodies, Body } from "matter-js";

import { Sprite } from "../sprites/sprite";
import { ColorSprite } from "../sprites/color.sprite";

import {
  Color,
  CreateBodyDefine,
  EntityInitial,
  EntityPrepare,
  MasterBody,
  Point,
  SensorBody,
} from "../../export-types";
import { EntitySuit } from "./entity-suit";
import { LogicComponent } from "../logic-component";
import { copyProperties, genId } from "../../utils";
import { Sound } from "../sound";
import { Sensor } from "../sensor";

type TimerJobListener = () => void;

type TerminateOptions = {
  duration?: number;
  effect?: EntitySuit | LogicComponent<EntitySuit>;
};

type TimerOptions = {
  defaultRun?: boolean;
  once?: boolean;
  startFrom?: number;
  onRegisterDone?: (time: number) => void;
};

type AddSensorParams = {
  name?: string;
  position?: Point;
} & (
  | {
      shape?: "rect";
      width: number;
      height: number;
      radius?: never;
    }
  | {
      shape: "circle";
      radius: number;
      width?: never;
      height?: never;
    }
);
export abstract class Entity<
  P extends Record<string, any> = Record<string, any>
> extends EntitySuit<EntityInitial<Entity>> {
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

  public debugSensor: boolean = false;
  public readonly sensors: Sensor[] = [];
  public enabledGravity: boolean = true;
  public sound?: Sound;
  public onTerminate?: () => void;

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

      if (effect) {
        this.addChild(effect);
      }
      setTimeout(() => {
        this.worldManagement.removeEntity(this);
        this.onTerminate?.();
      }, duration * 1000);
    } else {
      this.worldManagement.removeEntity(this);
      this.onTerminate?.();
    }
  }

  /**
   * @param {number} interval in milliseconds
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
  ): {
    remove: () => void;
    reset: () => void;
  } {
    const listener = {
      timeCounter: startFrom != null ? new Date().getTime() - startFrom : 0,
      interval,
      job,
      defaultRun,
    };
    this.timerJobListeners.push(listener);

    const unSub = () => {
      const index = this.timerJobListeners.indexOf(listener);
      if (index > -1) {
        this.timerJobListeners.splice(index, 1);
      }
    };

    if (once) {
      listener.job = () => {
        job();
        unSub();
      };
    }

    if (onRegisterDone) {
      onRegisterDone(startFrom ?? new Date().getTime()); //todo: this may not invoke correctly
    }
    return {
      remove: unSub,
      reset: () => {
        listener.timeCounter = 0;
      },
    };
  }

  removeSensor(sensor: Sensor) {
    const delIndex = this.sensors.indexOf(sensor);
    if (delIndex > -1) {
      this.sensors.splice(delIndex);
      this.worldManagement.removeBody(sensor.body);
    }
  }

  /**
   * @param {Point} position delta position of sensor base on entity position
   * @param {string} name name of sensor
   * @param {"rect"|"circle"} shape type of shape of physical body, ex: "rect"|"circle"
   * @param {number} width width of sensor, apply when in "rect" shape
   * @param {number} height height of sensor, apply when in "rect" shape
   * @param {number} radius radius of sensor, apply when in "circle" shape
   * @param {boolean} debug allow to show sensor for debug purpose, have to enable entity.debugSensor = true first
   * @param {boolean} debugColor allow to change sensor color
   * @void
   */
  addSensor(
    { position, name, shape = "rect", width, height, radius }: AddSensorParams,
    debug: boolean = false,
    debugColor?: Color
  ) {
    name = name || genId();

    const pos = { ...this.position };

    let sensor: Sensor;
    if (shape === "rect") {
      sensor = new Sensor(
        this,
        name,
        position || { x: 0, y: 0 },
        { width, height },
        shape,
        Bodies.rectangle(pos.x, pos.y, width, height, {
          isSensor: true,
        }) as SensorBody,
        debug,
        debugColor
      );
    } else {
      sensor = new Sensor(
        this,
        name,
        position || { x: 0, y: 0 },
        { width: radius * 2, height: radius * 2 },
        shape,
        Bodies.circle(pos.x, pos.y, radius, {
          isSensor: true,
        }) as SensorBody,
        debug,
        debugColor
      );
    }
    this.sensors.push(sensor);
    this.worldManagement.addBody(sensor.body);
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
   * invoke before entity setup completed, this is need to provide information of name, sprite, animation, animator, transform,...
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
      if (defaultRun || timeCounter >= interval) {
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
      this.onDraw();
    }
  }

  /**
   * invoke in every frame, this is necessary for draw that need to run in every frame
   * @void
   */
  onDraw() {}

  abstract getSpriteWidthHeight(): { width: number; height: number };

  onCollision(target: Entity | Sensor) {}
  onCollisionEnd(target: Entity | Sensor) {}
  onCollisionActive(target: Entity | Sensor) {}

  onSensorCollision(sensor: Sensor, target: Entity | Sensor) {}
  onSensorCollisionEnd(sensor: Sensor, target: Entity | Sensor) {}
  onSensorCollisionActive(sensor: Sensor, target: Entity | Sensor) {}
}
