import p5 from "p5";
import { Initialler } from "../export-interfaces";
import { Avatar, Color } from "../export-types";
import { copyProperties } from "../utils";
import { Camera } from "./camera";

export type ParticleInitialParams = {
  vec?: p5.Vector;
  angle?: number;
  sprite?: Avatar;
  color?: Color;
  size?: number;
  lifetime?: number;
  camera: Camera;
  forceSpriteSize?: boolean;
};

export class Particle
  extends p5.Vector
  implements Initialler<ParticleInitialParams>
{
  private vec: p5.Vector = Renderer.createVector(); //velocity
  private acc: p5.Vector = Renderer.createVector(); //acceleration
  private angle: number = 0;
  public camera!: Camera;
  public sprite?: Avatar;
  public color: Color = [255, 255, 255];
  public size: number = 5;
  public lifetimeRemain: number = this.lifetime; // in seconds

  private forceSpriteSize: boolean = false;
  private _lifetime: number = 2; // in seconds

  set lifetime(lifetime: number) {
    this._lifetime = lifetime;
    this.lifetimeRemain = lifetime;
  }

  get lifetime() {
    return this._lifetime;
  }

  initial({ vec, ...params }: ParticleInitialParams) {
    if (vec) {
      this.vec.set(vec.x, vec.y);
    }
    copyProperties(this, params);
  }

  applyForce(force: p5.Vector) {
    this.acc.add(force);
  }

  isDead() {
    return this.lifetimeRemain <= 0;
  }

  update() {
    this.vec.add(this.acc);
    this.add(this.vec);
    this.acc.set(0);

    this.lifetimeRemain -= Renderer.deltaTime / 1000;
  }

  draw() {
    Renderer.push();
    Renderer.noStroke();
    Renderer.translate(this.x - this.camera.x, this.y - this.camera.y);
    Renderer.rotate(this.angle);

    const color: Color = [...this.color];
    const alpha = Renderer.map(this.lifetimeRemain, 0, this.lifetime, 0, 255);
    color[3] = alpha;

    if (this.sprite) {
      const size = this.forceSpriteSize
        ? [this.size, this.size]
        : [this.sprite.width, this.sprite.height];
      Renderer.tint(...color);
      Renderer.image(
        this.sprite,
        // position on canvas
        0,
        0,
        ...size,
        //crop on source image
        0,
        0,
        this.sprite.width,
        this.sprite.height
      );
    } else {
      Renderer.fill(...color);
      this.onDraw(color);
    }
    //
    Renderer.pop();
  }

  onDraw(_: Color) {
    Renderer.circle(0, 0, this.size);
  }
}
