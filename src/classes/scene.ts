import { ComponentType } from "react";

import { Camera } from "./camera";
import { LogicComponent } from "./logic-component";
import { SceneManagement } from "./scene-management";
import { WorldManagement } from "./world-management";
import { EntitySult } from "./entities/entity-sult";

import { tick } from "../utils";

type LoadAssetsListener = (loadedAssets: boolean) => void;

export abstract class Scene<UIP = any> {
  private ui: ComponentType<UIP>;
  private worldManagement!: WorldManagement;
  private _loadedAssets!: boolean;
  private loadAssetsListener!: LoadAssetsListener;

  public assetsDelay: number = 0;
  public tag: string;
  public manager!: SceneManagement;
  public readonly sessionId: string = `${Math.random()}-${new Date().getTime()}`;
  public abstract getComponents(camera: Camera): LogicComponent<EntitySult>[];

  constructor() {
    this.tag = (this as any).constructor.tag;
    this.ui = (this as any).constructor.ui;
    this._loadedAssets = false;
    this.onBorn();
  }

  get UI() {
    const Ui = this.ui || (() => null);
    return Ui;
  }

  get UIProps() {
    return this.getUIProps();
  }

  protected onBorn() {}

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

  async loadAssets(delay?: number) {
    if (delay != null) {
      this.assetsDelay = delay;
    }
    // if delay less than 0, it will wait forever
    await tick(this.assetsDelay < 0 ? undefined : this.assetsDelay);

    this.setLoadAssetStatus(false);
    await this.onLoadAssets().catch((err) => {
      console.warn("Load assets fail", err.toString());
    });
    this.setLoadAssetStatus(true);
  }

  async onLoadAssets() {}

  bootstrap(camera: Camera) {
    this.worldManagement = new WorldManagement(camera);
    const components = this.getComponents(camera);
    for (const component of components) {
      const entity: EntitySult = component.output();
      this.worldManagement.addEntity(entity);
    }
  }

  protected onDraw() {}
  protected onUpdate() {}

  action() {
    this.onUpdate();
    this.worldManagement.update();

    Renderer.background(41, 41, 41);
    this.onDraw();
    this.worldManagement.draw();
  }
}
