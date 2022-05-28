import { Initialler } from "../../export-interfaces";
import { Camera } from "../camera";
import { Scene } from "../scene";
import { WorldManagement } from "../world-management";

export abstract class EntitySult<P = any> implements Initialler<P> {
  public camera!: Camera;
  public readonly tag!: string;
  public readonly id: string = `${Math.random()}-${new Date().getTime()}`;

  private _layerIndex: number = 0;
  private _name = this.id;
  private _scene!: Scene;
  private _worldManagement!: WorldManagement;

  constructor() {
    this.tag = (this as any).constructor.tag;
  }

  abstract update(): void;
  abstract draw(): void;

  get layerIndex() {
    return this._layerIndex;
  }

  get name() {
    return this._name;
  }

  set layerIndex(_layerIndex: number) {
    if (this._layerIndex !== _layerIndex) {
      this.worldManagement.changeEntityLayerIndex(this, _layerIndex);
    }
    this._layerIndex = _layerIndex;
  }

  set name(_name: string) {
    const isDuplicated = this.worldManagement?.getEntity(_name);
    if (isDuplicated) {
      console.warn(`Name ${_name} is already in use`);
    } else {
      if (this._name !== _name) {
        this.worldManagement.changeEntityName(this, _name);
      }
      this._name = _name;
    }
  }

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
    console.log(`Active ${this.tag} entity (name : ${this._name})`);
    this.onActive();
  }

  onActive() {}
  initial(params: P) {}
}
