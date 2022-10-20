import { Engine, World, Events, Body } from "matter-js";

import { MasterBody, SensorBody } from "../export-types";

import { SimpleCamera } from "./simple-camera";
import { Scene } from "./scene";
import { LogicComponent } from "./logic-component";

import { Entity } from "./entities/entity";
import { EntitySuit } from "./entities/entity-suit";

export class WorldManagement {
  private readonly entitiesHash: Record<string, EntitySuit> = {};
  private readonly entitiesPool: Record<
    EntitySuit["layerIndex"],
    EntitySuit["id"][]
  > = {};
  private readonly entitiesName: Record<EntitySuit["_name"], EntitySuit["id"]> =
    {};

  private _engine: Engine;

  constructor(private _camera: SimpleCamera, private _scene: Scene) {
    this._engine = Engine.create();
    Events.on(this.engine, "beforeUpdate", () => {
      const gravity = this.engine.gravity;
      const negativeGravityScale = {
        x: -gravity.x * gravity.scale,
        y: -gravity.y * gravity.scale,
      };

      this.iterateEntities((target) => {
        if (target instanceof Entity) {
          if (target.havePhysicBody && !target.enabledGravity) {
            const targetBody = target.body;
            Body.applyForce(targetBody, targetBody.position, {
              x: negativeGravityScale.x * targetBody.mass,
              y: negativeGravityScale.y * targetBody.mass,
            });
          }

          const { x: entityX, y: entityY } = target.position;
          for (const { body, relativePosition } of target.sensors) {
            Body.setPosition(body, {
              x: entityX + relativePosition.x,
              y: entityY + relativePosition.y,
            });
            Body.applyForce(body, body.position, {
              x: negativeGravityScale.x * body.mass,
              y: negativeGravityScale.y * body.mass,
            });
          }
        }
      });
    });
    Events.on(this.engine, "collisionStart", (event) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair as any as {
          bodyA: any;
          bodyB: any;
        };
        this.bindCollectionEvent("Collision", bodyA, bodyB);
        this.bindCollectionEvent("Collision", bodyB, bodyA);
      }
    });
    Events.on(this.engine, "collisionEnd", (event) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair as any as {
          bodyA: MasterBody;
          bodyB: MasterBody;
        };
        this.bindCollectionEvent("CollisionEnd", bodyA, bodyB);
        this.bindCollectionEvent("CollisionEnd", bodyB, bodyA);
      }
    });
    Events.on(this.engine, "collisionActive", (event) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair as any as {
          bodyA: MasterBody;
          bodyB: MasterBody;
        };
        this.bindCollectionEvent("CollisionActive", bodyA, bodyB);
        this.bindCollectionEvent("CollisionActive", bodyB, bodyA);
      }
    });
  }

  private bindCollectionEvent(
    name: "Collision" | "CollisionEnd" | "CollisionActive",
    sourceBody: MasterBody | SensorBody,
    targetBody: MasterBody | SensorBody
  ) {
    const targetCol =
      "sensor" in targetBody ? targetBody.sensor : targetBody.entity;

    if ("sensor" in sourceBody) {
      //ex: onSensorCollision | onSensorCollisionEnd | onSensorCollisionActive
      sourceBody.entity[`onSensor${name}`](sourceBody.sensor, targetCol);
    } else {
      //ex: onCollision | onCollisionEnd | onCollisionActive
      sourceBody.entity[`on${name}`](targetCol);
    }
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

  iterateEntities(action: (entity: EntitySuit) => boolean | undefined | void) {
    const { entitiesPool, entitiesHash } = this;
    const indexes = Object.keys(this.entitiesPool).map((idx) => +idx);
    indexes.sort((a, b) => a - b);

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

  private joinPool(index: number, entity: EntitySuit) {
    this.entitiesPool[index] = this.entitiesPool[index] || [];
    this.entitiesPool[index].push(entity.id);
  }

  private outPool(entity: EntitySuit) {
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

  changeEntityLayerIndex(entity: EntitySuit, newIndex: number) {
    this.outPool(entity);
    this.joinPool(newIndex, entity);
  }

  changeEntityName(entity: EntitySuit, newName: string) {
    delete this.entitiesName[entity.name];
    this.entitiesName[newName] = entity.id;
  }

  bootstrapCompleted() {
    this.iterateEntities((entity) => {
      entity.bootstrapCompleted(this);
    });
  }

  getEntity<T extends EntitySuit = EntitySuit>(
    name: string | { new (): T }
  ): T {
    if (typeof name === "string") {
      const id = this.entitiesName[name];
      return this.entitiesHash[id] as T;
    } else {
      let found;
      this.iterateEntities((entity) => {
        if (entity instanceof name) {
          found = entity;
          return true;
        }
      });
      return found;
    }
  }

  addBody(body: Body) {
    World.add(this.engine.world, body);
  }

  removeBody(body: Body) {
    World.remove(this.engine.world, body);
  }

  addEntity(target: EntitySuit | LogicComponent<EntitySuit>) {
    const entity = target instanceof EntitySuit ? target : target.output();
    this.joinPool(entity.layerIndex, entity);
    this.entitiesHash[entity.id] = entity;
    this.entitiesName[entity.name] = entity.id;

    if (entity instanceof Entity) {
      if (entity.havePhysicBody) {
        this.addBody(entity.body);
      }
    }
    entity.active(this);
  }

  removeEntity(entity: EntitySuit) {
    if (entity instanceof Entity) {
      if (entity.havePhysicBody) {
        this.removeBody(entity.body);
      }
      for (const sensor of entity.sensors) {
        this.removeBody(sensor.body);
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
      if (entity.isVisible) {
        entity.draw();
      }

      if (entity instanceof Entity) {
        if (entity.debugSensor) {
          for (const sensor of entity.sensors) {
            if (sensor.debug) {
              const { width, height } = sensor.size;
              Renderer.drawHandle(sensor.body.position, (renderer) => {
                renderer.fill(sensor.debugColor);
                renderer.rect(0, 0, width, height);
              });
            }
          }
        }
      }
    });
  }
}
