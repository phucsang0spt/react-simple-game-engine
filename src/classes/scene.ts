import { ComponentType } from "react";

import { Entity } from "./entities/entity";

import { Camera } from "./camera";
import { LogicComponent } from "./logic-component";
import { SceneManagement } from "./scene-management";
import { WorldManagement } from "./world-management";

type LoadAssetsListener = (loadedAssets: boolean) => void;

export abstract class Scene<UIP = any> {
  private ui: ComponentType<UIP>;
  private worldManagement!: WorldManagement;
  private _loadedAssets!: boolean;
  private loadAssetsListener!: LoadAssetsListener;

  public tag: string;
  public manager!: SceneManagement;
  public readonly sessionId: string = `${Math.random()}-${new Date().getTime()}`;
  public abstract getComponents(): LogicComponent[];

  constructor() {
    this.tag = (this as any).constructor.tag;
    this.ui = (this as any).constructor.ui;
    this._loadedAssets = false;
  }

  get UI() {
    const Ui = this.ui || (() => null);
    return Ui;
  }

  get UIProps() {
    return this.getUIProps();
  }

  protected getUIProps() {
    return {} as UIP;
  }

  get loadedAssets() {
    return this._loadedAssets;
  }

  onLoadAssetNotify(func: LoadAssetsListener) {
    this.loadAssetsListener = func;
  }

  destructor() {
    this.worldManagement.destructor();
  }

  setLoadAssetStatus(loadedAssets: boolean) {
    this._loadedAssets = loadedAssets;
    this.loadAssetsListener?.(loadedAssets);
  }

  switchToScene(tag: string) {
    this.manager.gotoScene(tag);
  }

  async loadAssets() {
    this.setLoadAssetStatus(false);
    await this.onLoadAssets().catch((err) => {
      console.warn("Load assets fail", err.toString());
    });
    this.setLoadAssetStatus(true);
  }

  async onLoadAssets() {}

  bootstrap(camera: Camera) {
    this.worldManagement = new WorldManagement();
    const components = this.getComponents();
    for (const component of components) {
      const entity: Entity = component.output() as any;
      entity.camera = camera;
      this.worldManagement.addEntity(entity);
    }
  }

  protected onDraw() {}
  protected onUpdate() {}

  action() {
    this.worldManagement.update();
    this.onUpdate();

    this.worldManagement.draw();
    this.onDraw();
  }
}
