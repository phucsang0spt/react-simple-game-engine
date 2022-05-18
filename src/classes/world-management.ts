import { Engine, World, Events } from "matter-js";
import { MasterBody } from "../export-types";
import { Camera } from "./camera";
import { Entity } from "./entities/entity";
import { EntitySult } from "./entities/entity-sult";

export class WorldManagement {
  private entities: EntitySult[] = [];
  private engine!: Engine;

  constructor(private camera: Camera) {
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

  addEntity(entity: EntitySult) {
    // temp pass modifier
    entity["camera"] = this.camera;
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
