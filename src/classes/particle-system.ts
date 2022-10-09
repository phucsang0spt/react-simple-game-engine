import p5 from "p5";
import { copyProperties } from "../utils";
import { Particle, ParticleInitialParams } from "./particle";
import { EntitySuit } from "./entities/entity-suit";

type ParticleClass = {
  new (...args: ConstructorParameters<typeof Particle>): Particle;
};

type ParticleOptions = Omit<
  ParticleInitialParams,
  "vec" | "angle" | "simpleCamera"
> & {
  x?: number;
  y?: number;
};

type ParticleSystemInitialParams = {
  particleClass?: ParticleClass;
  particleOptions?: ParticleOptions;
  quantityPerFrame?: number;
  vecWeight?: number;
  forces?: p5.Vector[];
};

export class ParticleSystem extends EntitySuit<ParticleSystemInitialParams> {
  private particles: Particle[] = [];
  private forces: p5.Vector[] = [];
  private particleOptions: ParticleOptions = {
    x: 0,
    y: 0,
  };
  private particleClass: ParticleClass = Particle;

  public quantityPerFrame: number = 50;
  public vecWeight: number = 5;

  initial({
    forces,
    particleOptions = {},
    ...params
  }: ParticleSystemInitialParams) {
    copyProperties(this.particleOptions, particleOptions);
    copyProperties(this, params);

    if (forces) {
      this.forces.push(...forces);
    }
  }

  update() {
    const ParticleClass = this.particleClass;
    const { x, y, ...particleOptions } = this.particleOptions;
    for (const _ of Array.from({ length: this.quantityPerFrame })) {
      const p = new ParticleClass(x, y);
      const vec = p5.Vector.random2D();
      vec.mult(Renderer.random(this.vecWeight));

      const angle = Renderer.random(Renderer.TWO_PI);
      p.initial({
        ...particleOptions,
        simpleCamera: this.simpleCamera,
        vec,
        angle,
      });
      this.particles.push(p);
    }

    for (let i = this.particles.length - 1; i > -1; i--) {
      const p = this.particles[i];
      for (const force of this.forces) {
        p.applyForce(force);
      }
      p.update();
      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    for (const particle of this.particles) {
      particle.draw();
    }
  }
}
