import { Engine, World, Events } from "matter-js";
import { MasterBody } from "../export-types";
import { Entity } from "./entities/entity";

export class WorldManagement {
  private entities: Entity[] = [];
  private engine!: Engine;
  constructor() {
    this.engine = Engine.create();
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

  destructor() {
    World.clear(this.engine.world, false);
    Engine.clear(this.engine);
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
    World.add(this.engine.world, entity.body);
    entity.active(this);
  }

  removeEntity(entity: Entity) {
    World.remove(this.engine.world, entity.body);
    this.entities.splice(this.entities.indexOf(entity), 1);
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
