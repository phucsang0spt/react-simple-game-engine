import { ComponentType } from "react";

import { Camera } from "./camera";
import { LogicComponent } from "./logic-component";
import { SceneManagement } from "./scene-management";
import { WorldManagement } from "./world-management";
import { EntitySult } from "./entities/entity-sult";
import { Prefab } from "./prefab";

import { copyProperties, tick } from "../utils";
import { Sound } from "./sound";
import { SoundManagement } from "../export-types";
import { SoundType } from "../export-enums";

type SoundOptionsChangeListener<O extends SoundType> = (
  options: SoundManagement[O]
) => void;
type LoadAssetsListener = (loadedAssets: boolean) => void;
type EntityPropsChangeListener<V = any> = (value: V) => void;

export abstract class Scene<UIP = any> {
  private ui: ComponentType<UIP>;
  private worldManagement!: WorldManagement;
  private _loadedAssets!: boolean;
  private loadAssetsListener!: LoadAssetsListener;
  private readonly entityPropsChangeListeners: Record<
    string,
    EntityPropsChangeListener[]
  > = {};
  private readonly soundBackgroundOptionsChangeListeners: SoundOptionsChangeListener<SoundType.BACKGROUND>[] =
    [];
  private readonly soundOnceOptionsChangeListeners: SoundOptionsChangeListener<SoundType.ONCE>[] =
    [];
  private readonly prefabs: Prefab[] = [];

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

  get soundBackgroundOptions() {
    return Sound.Management[SoundType.BACKGROUND];
  }

  get soundOnceOptions() {
    return Sound.Management[SoundType.ONCE];
  }

  set soundBackgroundOptions(options: SoundManagement[SoundType.BACKGROUND]) {
    copyProperties(Sound.Management[SoundType.BACKGROUND], options);
    for (const listener of this.soundBackgroundOptionsChangeListeners) {
      listener(Sound.Management[SoundType.BACKGROUND]);
    }
  }

  set soundOnceOptions(options: SoundManagement[SoundType.ONCE]) {
    copyProperties(Sound.Management[SoundType.ONCE], options);
    for (const listener of this.soundOnceOptionsChangeListeners) {
      listener(Sound.Management[SoundType.ONCE]);
    }
  }

  onSoundOnceOptionsChange(func: SoundOptionsChangeListener<SoundType.ONCE>) {
    const listeners = this.soundOnceOptionsChangeListeners;
    listeners.push(func);
    return () => {
      const index = listeners.indexOf(func);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  onSoundBackgroundOptionsChange(
    func: SoundOptionsChangeListener<SoundType.BACKGROUND>
  ) {
    const listeners = this.soundBackgroundOptionsChangeListeners;
    listeners.push(func);
    return () => {
      const index = listeners.indexOf(func);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  private bootSoundOptions() {
    const options = this.getSoundOptions();
    copyProperties(
      Sound.Management[SoundType.ONCE],
      options[SoundType.ONCE] || {}
    );
    copyProperties(
      Sound.Management[SoundType.BACKGROUND],
      options[SoundType.BACKGROUND] || {}
    );
  }

  protected getSoundOptions(): Partial<SoundManagement> {
    return {};
  }

  protected onBorn() {}

  protected getUIProps(): UIP {
    return {} as UIP;
  }

  get loadedAssets() {
    return this._loadedAssets;
  }

  private set loadedAssets(loadedAssets: boolean) {
    this._loadedAssets = loadedAssets;
    this.loadAssetsListener?.(loadedAssets);
  }

  emitEntityPropsChange<V = any>(name: string, value: V) {
    const listeners = this.entityPropsChangeListeners[name] || [];
    for (const listener of listeners) {
      listener(value);
    }
  }

  onEntityPropsChange<V = any>(
    name: string,
    func: EntityPropsChangeListener<V>
  ) {
    const listeners = (this.entityPropsChangeListeners[name] =
      this.entityPropsChangeListeners[name] || []);

    listeners.push(func);

    return () => {
      const index = listeners.indexOf(func);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  onLoadAssetNotify(func: LoadAssetsListener) {
    this.loadAssetsListener = func;
  }

  destructor() {
    this.worldManagement.destructor();
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

    this.loadedAssets = false;
    await this.onLoadAssets().catch((err) => {
      console.warn("Load assets fail", err.toString());
    });
    this.loadedAssets = true;
  }

  async onLoadAssets() {}

  getPrefab<C extends EntitySult>(Class: {
    new (...args: any[]): Prefab<C>;
  }): Prefab<C> {
    return this.prefabs.find((pf) => pf instanceof Class) as Prefab<C>;
  }

  bootstrap(camera: Camera) {
    this.bootSoundOptions();

    this.worldManagement = new WorldManagement(camera, this);
    const components = this.getComponents(camera);

    let layerIndex = 0;
    for (const component of components) {
      component.worldManagement = this.worldManagement;
      component.layerIndex = layerIndex++;
      if (component.isPrefab) {
        this.prefabs.push(component);
      } else {
        const entity: EntitySult = component.output();
        this.worldManagement.addEntity(entity);
      }
    }
  }

  protected onDraw() {}
  protected onUpdate() {}

  action() {
    if (Renderer.running) {
      this.onUpdate();
      this.worldManagement.update();
    }

    Renderer.background(41, 41, 41);
    this.onDraw();
    this.worldManagement.draw();
  }
}
