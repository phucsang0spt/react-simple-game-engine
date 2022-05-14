type P5 = import("p5");

declare interface Window {
  Renderer: P5;
  Debug: any;
}

declare var Renderer: P5;
declare var Debug: any;

type IEntity = import("./classes/entities/entity").Entity;
type ISprite = import("./classes/sprites/sprite").Sprite;

type CreateBodyDefine = {
  transform?: { x?: number; y?: number };
  bodyOptions?: Matter.IChamferableBodyDefinition;
};

type EntityInitial<E extends IEntity> = {
  transform?: Parameters<E["onCreateBody"]>[0];
  bodyOptions?: Parameters<E["onCreateBody"]>[1];
  sound?: Sound;
  sprite?: import("./classes/logic-component").LogicComponent<ISprite>;
};

type Configable<C extends { initial: any } = IEntity> =
  | {
      new (): C;
    }
  | [{ new (): C }, Parameters<C["initial"]>[0]?];
