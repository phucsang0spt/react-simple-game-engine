import { Entity } from "./classes/entities/entity";
import { Sprite } from "./classes/sprites/sprite";

import type { Body, IChamferableBodyDefinition } from "matter-js";
import { Initializer } from "./export-interfaces";
import { Sound } from "./classes/sound";
import { SoundType } from "./export-enums";

export type { Collection } from "./classes/p5";

export type Avatar = ReturnType<import("./classes/p5").P5["loadImage"]>;
export type Color = [number, number, number, number?];
export type Point = { x: number; y: number };
export type Offset = Point & { width: number; height: number };
export type EntityPrepare<E extends Entity> = EntityInitial<E> & {
  enabledPhysicBody?: boolean;
  enabledGravity?: boolean;
};
export type MasterBody = Body & {
  entity: Entity;
};

export type SensorBody = Body & {
  sensor: import("./classes/sensor").Sensor;
  entity: Entity;
};

export type CreateBodyDefine<
  E extends Record<string, any> = Record<string, any>
> = {
  transform?: Partial<Point> & E;
  bodyOptions?: IChamferableBodyDefinition;
};

//@ts-ignore
type TransformArgs<E extends Entity> = Parameters<E["onCreateBody"]>[1];

//@ts-ignore
type BodyOptionsArgs<E extends Entity> = Parameters<E["onCreateBody"]>[2];

export type EntityInitial<E extends Entity> = {
  transform?: TransformArgs<E>;
  bodyOptions?: BodyOptionsArgs<E>;
  sprite?: import("./classes/logic-component").LogicComponent<Sprite<any>>;
  sound?: Sound;
  name?: string;
  isVisible?: boolean;
  scaleX?: number;
  scaleY?: number;
  //@ts-ignore
  props?: Partial<E["props"]>;
};

export type Configuration<C extends Initializer> = Parameters<C["initial"]>[0];

export type Configurable<C extends Initializer = Initializer> =
  | {
      new (): C;
    }
  | [{ new (): C }, Configuration<C>];

export type SoundManagement = Record<
  SoundType,
  {
    canPlay: boolean;
  }
>;

export type SoundDecor = {
  propertyKey: string;
  src?: string;
  type: SoundType;
  volume?: number;
};

export type SpriteDecor = {
  propertyKey: string;
  src?: string;
};

export type GetSoundOptions = DeepPartial<SoundManagement>;

export type Size = {
  width: number;
  height: number;
};

export type JoystickAction =
  | {
      type:
        | import("./export-enums").JoystickActionType.START
        | import("./export-enums").JoystickActionType.STOP;
      vector?: null | never;
      length?: null | never;
      weight?: null | never;
      direction?: null | never;
    }
  | {
      type: import("./export-enums").JoystickActionType.MOVE;
      vector: import("p5").Vector;
      length: number;
      weight: number;
      direction: import("./export-enums").JoystickDirection;
    };

export type AssetErrorType = "load-sound" | "load-sprite" | "load-extends";
export type AssetsFailBehavior =
  | {
      skip: true;
      render?: never;
    }
  | {
      skip?: false;
      render?: (
        errors: { type: AssetErrorType; detail: any }[]
      ) => import("react").ReactElement;
    };

export type Vector = import("p5").Vector;

export type AnimationInitialParams<
  E extends Record<string, any> = Record<string, any>
> = {
  timePerFrame?: number;
  source?: Avatar;
  size?: Size;
  maxCycle?: number;
  isRunning?: boolean;
} & E;

export type EntityEdge = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
