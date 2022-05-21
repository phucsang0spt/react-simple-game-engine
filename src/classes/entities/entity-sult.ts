import { Initialler } from "../../export-interfaces";
import { Camera } from "../camera";
import { Scene } from "../scene";
import { WorldManagement } from "../world-management";

export abstract class EntitySult<P = any> implements Initialler<P> {
  public camera!: Camera;
  public readonly tag!: string;

  private readonly id: string = `${Math.random()}-${new Date().getTime()}`;
  private _scene!: Scene;
  private _worldManagement!: WorldManagement;
  public name = this.id;

  constructor() {
    this.tag = (this as any).constructor.tag;
  }

  abstract update(): void;
  abstract draw(): void;

  get scene() {
    return this._scene;
  }

  get worldManagement() {
    return this._worldManagement;
  }

  getProperty<T>(name: string): T {
    return (this as any)[name];
  }

  preInitial(worldManagement: WorldManagement) {
    this._worldManagement = worldManagement;
    this._scene = worldManagement.scene;
    this.camera = worldManagement.camera;
  }

  active(worldManagement: WorldManagement) {
    if (!this._worldManagement) {
      this._worldManagement = worldManagement;
      this._scene = worldManagement.scene;
      this.camera = worldManagement.camera;
    }
    console.log(`Active ${this.tag} entity (name : ${this.name})`);
    this.onActive();
  }

  onActive() {}
  initial(params: P) {}
}
