import { Engine, World, Events, Body } from "matter-js";

import { MasterBody } from "../export-types";

import { SimpleCamera } from "./simple-camera";
import { Scene } from "./scene";

import { Entity } from "./entities/entity";
import { EntitySult } from "./entities/entity-sult";

export class WorldManagement {
  private readonly entitiesHash: Record<string, EntitySult> = {};
  private readonly entitiesPool: Record<
    EntitySult["layerIndex"],
    EntitySult["id"][]
  > = {};
  private readonly entitiesName: Record<EntitySult["_name"], EntitySult["id"]> =
    {};

  private _engine: Engine;

  constructor(private _camera: SimpleCamera, private _scene: Scene) {
    this._engine = Engine.create();
    Events.on(this.engine, "beforeUpdate", () => {
      const gravity = this.engine.gravity;
      this.iterateEntities((entity) => {
        if (
          entity instanceof Entity &&
          entity.havePhysicBody &&
          !entity.enabledGravity
        ) {
          Body.applyForce(entity.body, entity.position, {
            x: -gravity.x * gravity.scale * entity.body.mass,
            y: -gravity.y * gravity.scale * entity.body.mass,
          });
        }
      });
    });
    Events.on(this.engine, "collisionStart", (event) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair as any as {
          bodyA: MasterBody;
          bodyB: MasterBody;
        };
        bodyA.entity.onCollision(bodyB.entity);
        bodyB.entity.onCollision(bodyA.entity);
      }
    });
    Events.on(this.engine, "collisionEnd", (event) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair as any as {
          bodyA: MasterBody;
          bodyB: MasterBody;
        };
        bodyA.entity.onCollisionEnd(bodyB.entity);
        bodyB.entity.onCollisionEnd(bodyA.entity);
      }
    });
    Events.on(this.engine, "collisionActive", (event) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair as any as {
          bodyA: MasterBody;
          bodyB: MasterBody;
        };
        bodyA.entity.onCollisionActive(bodyB.entity);
        bodyB.entity.onCollisionActive(bodyA.entity);
      }
    });
  }

  get engine() {
    return this._engine;
  }

  get camera() {
    return this._camera;
  }

  get scene() {
    return this._scene;
  }

  iterateEntities(action: (entity: EntitySult) => boolean | undefined | void) {
    const { entitiesPool, entitiesHash } = this;
    const indexes = Object.keys(this.entitiesPool).map((idx) => +idx);
    indexes.sort();

    for (const index of indexes) {
      const entitiesId = entitiesPool[index];
      let isBreak: any = false;
      for (const id of entitiesId) {
        const entity = entitiesHash[id];
        isBreak = action(entity);
        if (isBreak) {
          break;
        }
      }
      if (isBreak) {
        break;
      }
    }
  }

  private joinPool(index: number, entity: EntitySult) {
    this.entitiesPool[index] = this.entitiesPool[index] || [];
    this.entitiesPool[index].push(entity.id);
  }

  private outPool(entity: EntitySult) {
    const pool = this.entitiesPool[entity.layerIndex];
    if (!pool) {
      return;
    }
    const delIndex = pool.indexOf(entity.id);
    if (delIndex > -1) {
      pool.splice(delIndex, 1);
    }
  }

  destructor() {
    World.clear(this.engine.world, false);
    Engine.clear(this.engine);
  }

  changeEntityLayerIndex(entity: EntitySult, newIndex: number) {
    this.outPool(entity);
    this.joinPool(newIndex, entity);
  }

  changeEntityName(entity: EntitySult, newName: string) {
    delete this.entitiesName[entity.name];
    this.entitiesName[newName] = entity.id;
  }

  bootstrapCompleted() {
    this.iterateEntities((entity) => {
      entity.bootstrapCompleted(this);
    });
  }

  getEntity<T extends EntitySult = EntitySult>(
    name: string | { new (): T }
  ): T {
    if (typeof name === "string") {
      const id = this.entitiesName[name];
      return this.entitiesHash[id] as T;
    } else {
      let finded;
      this.iterateEntities((entity) => {
        if (entity instanceof name) {
          finded = entity;
          return true;
        }
      });
      return finded;
    }
  }

  addEntity(entity: EntitySult) {
    this.joinPool(entity.layerIndex, entity);
    this.entitiesHash[entity.id] = entity;
    this.entitiesName[entity.name] = entity.id;

    if (entity instanceof Entity) {
      if (entity.havePhysicBody) {
        World.add(this.engine.world, entity.body);
      }
    }
    entity.active(this);
  }

  removeEntity(entity: EntitySult) {
    if (entity instanceof Entity) {
      if (entity.havePhysicBody) {
        World.remove(this.engine.world, entity.body);
      }
    }
    for (const child of entity.children) {
      this.removeEntity(child);
    }
    if (entity.parent) {
      entity.parent.unChild(entity);
    }
    delete this.entitiesName[entity.name];
    delete this.entitiesHash[entity.id];
    this.outPool(entity);
  }

  update() {
    Engine.update(this.engine);
    this.iterateEntities((entity) => {
      entity.update();
    });
  }

  draw() {
    this.iterateEntities((entity) => {
      entity.draw();
    });
  }
}
