import { Initialler } from "../../export-interfaces";
import { Camera } from "../camera";
import { LogicComponent } from "../logic-component";
import { Scene } from "../scene";
import { WorldManagement } from "../world-management";

export abstract class EntitySult<P = any> implements Initialler<P> {
  public camera!: Camera;
  public readonly id: string = `${Math.random()}-${new Date().getTime()}`;

  private _layerIndex: number = 0;
  private _name = this.id;
  private _scene!: Scene;
  private _worldManagement!: WorldManagement;
  private _children: EntitySult[] = [];
  private _parent?: EntitySult;

  abstract update(): void;
  abstract draw(): void;

  get children() {
    return this._children;
  }

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

  get parent() {
    return this._parent;
  }

  get scene() {
    return this._scene;
  }

  get worldManagement() {
    return this._worldManagement;
  }

  addChild(target: EntitySult | LogicComponent<EntitySult>) {
    const entity =
      target instanceof EntitySult
        ? target
        : target.output({ worldManagement: this.worldManagement });
    entity._parent = this;

    this.children.push(entity);
    this.worldManagement.addEntity(entity);
  }

  removeChild(entity: EntitySult) {
    this.unChild(entity);
    this.worldManagement.removeEntity(entity);
  }

  unChild(entity: EntitySult) {
    const delIndex = this.children.indexOf(entity);
    if (delIndex > -1) {
      this.children.splice(delIndex, 1);
    }
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
    console.log(`Active entity (name : ${this._name})`);
    this.onActive();
  }

  onActive() {}
  initial(params: P) {}
}
