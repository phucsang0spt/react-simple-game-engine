import { Entity } from "./classes/entities/entity";
import { Sprite } from "./classes/sprites/sprite";

import type { Body, IChamferableBodyDefinition } from "matter-js";
import { Initialler } from "./export-interfaces";
import { Sound } from "./classes/sound";
import { SoundType } from "./export-enums";

export type { Collection } from "./classes/p5";

export type Avatar = ReturnType<import("./classes/p5").P5["loadImage"]>;
export type Color = [number, number, number, number?];

export type EntityPrepare<E extends Entity> = EntityInitial<E>;
export type MasterBody = Body & {
  entity: Entity;
};

export type CreateBodyDefine<
  E extends Record<string, any> = Record<string, any>
> = {
  transform?: { x?: number; y?: number } & E;
  bodyOptions?: IChamferableBodyDefinition;
};

//@ts-ignore
type TransformArgs<E extends Entity> = Parameters<E["onCreateBody"]>[0];

//@ts-ignore
type BodyOptionsArgs<E extends Entity> = Parameters<E["onCreateBody"]>[1];

export type EntityInitial<E extends Entity> = {
  transform?: TransformArgs<E>;
  bodyOptions?: BodyOptionsArgs<E>;
  sprite?: import("./classes/logic-component").LogicComponent<Sprite<any>>;
  sound?: Sound;
  enabledGravity?: boolean;
  name?: string;
  //@ts-ignore
  props?: Partial<E["props"]>;
};

export type Configation<C extends Initialler> = Parameters<C["initial"]>[0];

export type Configable<C extends Initialler = Initialler> =
  | {
      new (): C;
    }
  | [{ new (): C }, Configation<C>];

export type SoundManagement = Record<
  SoundType,
  {
    canPlay: boolean;
    loop: boolean;
  }
>;

export type SoundDecor = {
  propertyKey: string;
  src: string;
  type: SoundType;
  volumn: number;
};

export type GetSoundOptions = DeepPartial<SoundManagement>;
