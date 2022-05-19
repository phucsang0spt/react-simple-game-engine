import { Engine, World, Events, Body } from "matter-js";

import { MasterBody } from "../export-types";

import { Camera } from "./camera";
import { Scene } from "./scene";

import { Entity } from "./entities/entity";
import { EntitySult } from "./entities/entity-sult";

export class WorldManagement {
  private _entities: EntitySult[] = [];
  private _engine!: Engine;

  constructor(private _camera: Camera, private _scene: Scene) {
    this._engine = Engine.create();
    Events.on(this.engine, "beforeUpdate", () => {
      const gravity = this.engine.gravity;
      for (const entity of this.entities) {
        if (entity instanceof Entity && !entity.enabledGravity) {
          Body.applyForce(entity.body, entity.position, {
            x: -gravity.x * gravity.scale * entity.body.mass,
            y: -gravity.y * gravity.scale * entity.body.mass,
          });
        }
      }
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

  get entities() {
    return this._entities;
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

  destructor() {
    World.clear(this.engine.world, false);
    Engine.clear(this.engine);
  }

  addEntity(entity: EntitySult) {
    // temp pass modifier
    this.entities.push(entity);
    if (entity instanceof Entity) {
      World.add(this.engine.world, entity.body);
    }
    entity.active(this);
  }

  removeEntity(entity: EntitySult) {
    const delIndex = this.entities.indexOf(entity);
    if (delIndex > -1) {
      if (entity instanceof Entity) {
        World.remove(this.engine.world, entity.body);
        for (const child of entity.children) {
          this.removeEntity(child);
        }
      }
      this.entities.splice(this.entities.indexOf(entity), 1);
    }
  }

  update() {
    Engine.update(this.engine);
    for (const entity of this.entities) {
      entity.update();
    }
  }

  draw() {
    for (const entity of this.entities) {
      entity.draw();
    }
  }
}
