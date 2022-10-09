import { Initializer } from "../../export-interfaces";
import { SimpleCamera } from "../simple-camera";
import { LogicComponent } from "../logic-component";
import { Scene } from "../scene";
import { WorldManagement } from "../world-management";
import { P5 } from "../p5";
import { genId } from "../../utils";

export abstract class EntitySuit<P = any> implements Initializer<P> {
  public simpleCamera: SimpleCamera;
  public readonly id: string = genId();

  private _layerIndex: number = 0;
  private _name = this.id;
  private _scene: Scene;
  private _worldManagement: WorldManagement;
  private _children: EntitySuit[] = [];
  private _parent?: EntitySuit;
  private _renderer: P5;
  public isVisible: boolean = true;
  public scaleX: number = 1;
  public scaleY: number = 1;

  abstract update(): void;
  abstract draw(): void;

  get renderer() {
    return this._renderer;
  }

  set renderer(_renderer: P5) {
    if (this._renderer) {
      console.warn("Not allow to change renderer of entity");
      return;
    }
    this._renderer = _renderer;
  }

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

  set worldManagement(_worldManagement: WorldManagement) {
    if (!this._worldManagement) {
      this._worldManagement = _worldManagement;
      this._renderer = _worldManagement.scene.renderer;
      this._scene = _worldManagement.scene;
      this.simpleCamera = _worldManagement.camera;
    }
  }

  get worldManagement() {
    return this._worldManagement;
  }

  addChild(target: EntitySuit | LogicComponent<EntitySuit>) {
    const entity = target instanceof EntitySuit ? target : target.output();
    entity._parent = this;
    entity._layerIndex = this._layerIndex;

    this.children.push(entity);
    this.worldManagement.addEntity(entity);
  }

  removeChild(entity: EntitySuit) {
    this.unChild(entity);
    this.worldManagement.removeEntity(entity);
  }

  unChild(entity: EntitySuit) {
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
    this._renderer = worldManagement.scene.renderer;
    this.simpleCamera = worldManagement.camera;
  }

  active(_: WorldManagement) {
    // console.log(`Active entity (name : ${this._name})`);
    this.onActive();
  }

  bootstrapCompleted(_: WorldManagement) {
    this.onBootstrapCompleted();
  }

  /**
   * invoke when mouse move on canvas
   * @void
   */
  onMouseMove() {}

  /**
   * invoke when mouse pressed on canvas
   * @void
   */
  onMousePressed() {}

  /**
   * invoke when mouse release from canvas
   * @void
   */
  onMouseRelease() {}

  /**
   * invoke when entity is added into world
   * @void
   */
  onActive() {}

  /**
   * invoke when scene bootstrap completed, if entity that added after scene completed like ex: prefab, bullet,... then this function will not invoke
   * @void
   */
  onBootstrapCompleted() {}

  initial(params: P) {}
}
