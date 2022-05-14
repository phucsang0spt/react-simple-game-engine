export type Sound = HTMLAudioElement;
export type Avatar = ReturnType<P5["loadImage"]>;
export type Color = [number, number, number, number?];

export type EntityPrepare<E extends IEntity> = EntityInitial<E>;
export type MasterBody = Matter.Body & {
  entity: IEntity;
};

export type P5 = import("p5");
