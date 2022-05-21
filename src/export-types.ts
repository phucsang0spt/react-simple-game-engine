import { Entity } from "./classes/entities/entity";
import { Sprite } from "./classes/sprites/sprite";

import type { Body, IChamferableBodyDefinition } from "matter-js";
import { Initialler } from "./export-interfaces";

export type { Collection } from "./classes/p5";

export type Sound = HTMLAudioElement;
export type Avatar = ReturnType<import("./classes/p5").P5["loadImage"]>;
export type Color = [number, number, number, number?];

export type EntityPrepare<E extends Entity> = EntityInitial<E>;
export type MasterBody = Body & {
  entity: Entity;
};

export type CreateBodyDefine = {
  transform?: { x?: number; y?: number };
  bodyOptions?: IChamferableBodyDefinition;
};

export type EntityInitial<E extends Entity> = {
  //@ts-ignore
  transform?: Parameters<E["onCreateBody"]>[0];
  //@ts-ignore
  bodyOptions?: Parameters<E["onCreateBody"]>[1];
  sprite?: import("./classes/logic-component").LogicComponent<Sprite<any>>;
  sound?: Sound;
  enabledGravity?: boolean;
};

export type Configable<C extends Initialler = Initialler> =
  | {
      new (): C;
    }
  | [{ new (): C }, Parameters<C["initial"]>[0]];
