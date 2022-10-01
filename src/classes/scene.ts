import { ComponentType, ReactElement } from "react";

import { LogicComponent } from "./logic-component";
import { SceneManagement } from "./scene-management";
import { WorldManagement } from "./world-management";
import { EntitySult } from "./entities/entity-sult";
import { Prefab } from "./prefab";

import {
  copyProperties,
  createAssetImage,
  createAssetSound,
  parallel,
  tick,
} from "../utils";
import { Sound } from "./sound";
import {
  AssetErrorType,
  AssetsFailBehavior,
  Avatar,
  GetSoundOptions,
  JoystickAction,
  SoundDecor,
  SoundManagement,
  SpriteDecor,
} from "../export-types";
import { SoundType } from "../export-enums";
import { SimpleCamera } from "./simple-camera";
import { P5 } from "./p5";

const MAX_ASSET_PARALLEL_LOAD = 4;

type SoundOptionsChangeListener<O extends SoundType> = (
  options: SoundManagement[O]
) => void;
type LoadAssetsListener = (
  loadedAssets: boolean,
  errors?: { type: AssetErrorType; detail: any }[]
) => void;
type EntityPropsChangeListener<V = any> = (value: V) => void;
type ProcessStateChangeListener = (isForeground: boolean) => void;
type JoystickActionListener = (data: JoystickAction) => void;

export abstract class Scene<UIP = any> {
  private ui: ComponentType<UIP>;
  private _worldManagement: WorldManagement;
  private _loadedAssets: boolean;
  private _renderer: P5;
  private _renderAssetsFail: () =>
    | ReactElement
    | Array<{ type: AssetErrorType; detail: any }>;
  private loadAssetsListener: LoadAssetsListener;
  private nativeEventsUnsubscribes: () => void = () => {};

  private readonly entityPropsChangeListeners: Record<
    string,
    EntityPropsChangeListener[]
  > = {};
  private readonly soundBackgroundOptionsChangeListeners: SoundOptionsChangeListener<SoundType.BACKGROUND>[] =
    [];
  private readonly soundOnceOptionsChangeListeners: SoundOptionsChangeListener<SoundType.ONCE>[] =
    [];
  private readonly processStateChangeListeners: ProcessStateChangeListener[] =
    [];
  private readonly joystickActionListeners: JoystickActionListener[] = [];

  private readonly prefabs: Prefab[] = [];
  private readonly soundsDecor: SoundDecor[];
  private readonly spritesDecor: SpriteDecor[];

  public readonly sounds: Sound[] = [];
  public readonly sprites: Avatar[] = [];
  public readonly sessionId: string = `${Math.random()}-${new Date().getTime()}`;

  public assetsDelay: number = 0;
  public tag: string;
  public manager: SceneManagement;

  constructor() {
    this.tag = (this as any).constructor.tag;
    this.ui = (this as any).constructor.ui;
    this.soundsDecor = (this as any).__proto__.soundsDecor || [];
    this.spritesDecor = (this as any).__proto__.spritesDecor || [];

    this._loadedAssets = false;
    this.onBorn();
  }

  get renderer() {
    return this._renderer;
  }

  get worldManagement() {
    return this._worldManagement;
  }

  get renderAssetsFail() {
    return this._renderAssetsFail;
  }

  get UI() {
    const Ui = this.ui || (() => null);
    return Ui;
  }

  get soundBackgroundOptions(): SoundManagement[SoundType.BACKGROUND] {
    return Sound.Management[SoundType.BACKGROUND];
  }

  get soundOnceOptions(): SoundManagement[SoundType.ONCE] {
    return Sound.Management[SoundType.ONCE];
  }

  set renderer(_renderer: P5) {
    if (this._renderer) {
      console.warn("Not allow to change renderer of scene");
      return;
    }
    this._renderer = _renderer;
  }

  set soundBackgroundOptions(
    options: Partial<SoundManagement[SoundType.BACKGROUND]>
  ) {
    copyProperties(Sound.Management[SoundType.BACKGROUND], options);
    for (const listener of this.soundBackgroundOptionsChangeListeners) {
      listener(Sound.Management[SoundType.BACKGROUND]);
    }
  }

  set soundOnceOptions(options: Partial<SoundManagement[SoundType.ONCE]>) {
    copyProperties(Sound.Management[SoundType.ONCE], options);
    for (const listener of this.soundOnceOptionsChangeListeners) {
      listener(Sound.Management[SoundType.ONCE]);
    }
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

  protected getSoundOptions(): GetSoundOptions {
    return {};
  }

  protected onBorn() {}

  protected getComponents(
    simpleCamera: SimpleCamera
  ): LogicComponent<EntitySult>[] {
    return [];
  }

  getUIProps(): Partial<UIP> {
    return {};
  }

  getInitialData(): { joystick?: boolean } {
    return {};
  }

  get loadedAssets() {
    return this._loadedAssets;
  }

  private set loadedAssets(loadedAssets: boolean) {
    this._loadedAssets = loadedAssets;
    this.loadAssetsListener?.(loadedAssets);
  }

  private set loadedAssetsError(
    errors: { type: AssetErrorType; detail: any }[]
  ) {
    this.loadAssetsListener?.(this._loadedAssets, errors);
  }

  onProcessStateChangeListener(func: ProcessStateChangeListener) {
    const listeners = this.processStateChangeListeners;
    listeners.push(func);
    return () => {
      const index = listeners.indexOf(func);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
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

  onJoystickAction(func: JoystickActionListener) {
    const listeners = this.joystickActionListeners;
    listeners.push(func);
    return () => {
      const index = listeners.indexOf(func);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
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

  emitJoystickAction(data: JoystickAction) {
    const listeners = this.joystickActionListeners;
    for (const listener of listeners) {
      listener(data);
    }
  }

  emitProcessStateChangeListener(isForeground: boolean) {
    const listeners = this.processStateChangeListeners;
    for (const listener of listeners) {
      listener(isForeground);
    }
  }

  emitEntityPropsChange<V = any>(name: string, value: V) {
    const listeners = this.entityPropsChangeListeners[name] || [];
    for (const listener of listeners) {
      listener(value);
    }
  }

  onLoadAssetNotify(func: LoadAssetsListener) {
    this.loadAssetsListener = func;
  }

  destructor() {
    this.nativeEventsUnsubscribes();
    this._worldManagement.destructor();
    for (const sound of this.sounds) {
      sound.stop();
    }
  }

  switchToScene(tag: string) {
    this.manager.gotoScene(tag);
  }

  private async loadSprites() {
    await parallel(
      this.spritesDecor,
      async (decor) => {
        if (decor.src) {
          const sprite = await createAssetImage(decor.src);
          (this as any)[decor.propertyKey] = sprite;
          this.sprites.push(sprite);
        }
      },
      MAX_ASSET_PARALLEL_LOAD
    );
  }

  private async loadSounds() {
    for (const decor of this.soundsDecor) {
      if (decor.src) {
        const sound = await createAssetSound(decor.src, decor.type);
        if (decor.volume) {
          sound.volume = decor.volume;
        }

        (this as any)[decor.propertyKey] = sound;
        this.sounds.push(sound);
      }
    }
  }

  createSprites(...srcables: (string | { src: string })[]) {
    return parallel(
      srcables,
      async (srcable) => {
        const { src } =
          typeof srcable === "string" ? { src: srcable } : srcable;
        const sprite = await createAssetImage(src);
        this.sprites.push(sprite);
        return sprite;
      },
      MAX_ASSET_PARALLEL_LOAD
    );
  }

  async createSounds(
    ...srcables: (string | { src: string; volume?: number; type?: SoundType })[]
  ) {
    const sounds: Sound[] = [];
    for (const srcable of srcables) {
      const {
        volume,
        src,
        type = SoundType.ONCE,
      } = typeof srcable === "string"
        ? { src: srcable, volume: undefined, type: undefined }
        : srcable;

      const sound = await createAssetSound(src, type);
      if (volume) {
        sound.volume = volume;
      }
      sounds.push(sound);
      this.sounds.push(sound);
    }
    return sounds;
  }

  async mapSprites(...srcs: string[]) {
    const spritesDecor = this.spritesDecor.filter((decor) => !decor.src);
    await parallel(
      srcs,
      async (src, { realIndex }) => {
        const decor = spritesDecor[realIndex];
        if (decor) {
          const sprite = await createAssetImage(src);
          (this as any)[decor.propertyKey] = sprite;
          this.sprites.push(sprite);
        }
      },
      MAX_ASSET_PARALLEL_LOAD
    );
  }

  async mapSounds(...srcs: string[]) {
    const soundsDecor = this.soundsDecor.filter((decor) => !decor.src);
    let index = 0;
    for (const decor of soundsDecor) {
      const src = srcs[index++];
      const sound = await createAssetSound(src, decor.type);
      if (decor.volume) {
        sound.volume = decor.volume;
      }
      (this as any)[decor.propertyKey] = sound;
      this.sounds.push(sound);
    }
  }

  async loadAssets(
    delay: number | undefined | null,
    { skip = false, render }: AssetsFailBehavior = {}
  ) {
    if (delay != null) {
      this.assetsDelay = delay;
    }
    // if delay less than 0, it will wait forever
    await tick(this.assetsDelay < 0 ? undefined : this.assetsDelay);

    this.loadedAssets = false;

    const resultLoadSound: any = await this.loadSounds().catch((err) => {
      return {
        error: true,
        type: "load-sound",
        detail: err,
      };
    });

    if (resultLoadSound?.error && !skip) {
      this._renderAssetsFail = () => {
        return render ? render([resultLoadSound]) : [resultLoadSound];
      };
      this.loadedAssetsError = [resultLoadSound];
      return;
    }

    const result = await Promise.all([
      this.loadSprites().catch((err) => {
        return {
          error: true,
          type: "load-sprite",
          detail: err,
        };
      }),
      this.onLoadAssets().catch((err) => {
        return {
          error: true,
          type: "load-extends",
          detail: err,
        };
      }),
    ]);

    const hasErrors = result.some((rs: any) => rs?.error);
    if (hasErrors && !skip) {
      const errors: any[] = result.filter((rs: any) => !!rs?.error);
      // this.loadedAssets = false;
      this._renderAssetsFail = () => {
        return render ? render(errors) : errors;
      };
      this.loadedAssetsError = errors;
    } else {
      // when dont have error or skip error
      this.loadedAssets = true;
    }
  }

  async onLoadAssets() {}

  getPrefab<C extends EntitySult>(Class: {
    new (...args: any[]): Prefab<C>;
  }): Prefab<C> {
    return this.prefabs.find((pf) => pf instanceof Class) as Prefab<C>;
  }

  listenNativeEvents() {
    const _this = this;
    function onVisibilitychange() {
      _this.emitProcessStateChangeListener(window.Renderer.isForeground);
    }
    window.document.addEventListener("visibilitychange", onVisibilitychange);

    this.nativeEventsUnsubscribes = () => {
      window.document.removeEventListener(
        "visibilitychange",
        onVisibilitychange
      );
    };
  }

  protected onBootstrapDone(simpleCamera: SimpleCamera) {}

  private bootstrapDone(simpleCamera: SimpleCamera) {
    this.onBootstrapDone(simpleCamera);
  }

  bootstrap(simpleCamera: SimpleCamera) {
    this._renderer = window.Renderer;
    this.listenNativeEvents();
    this.bootSoundOptions();

    this.onProcessStateChangeListener((isForeground) => {
      if (isForeground) {
        if (window.Renderer.running) {
          for (const sound of this.sounds) {
            // only resume background sounds
            if (sound.type === SoundType.BACKGROUND) {
              sound.resume();
            }
          }
        }
      } else {
        // pause all sounds
        for (const sound of this.sounds) {
          sound.pause();
        }
      }
    });

    this._worldManagement = new WorldManagement(simpleCamera, this);
    const components = this.getComponents(simpleCamera);

    let layerIndex = 0;
    for (const component of components) {
      component.worldManagement = this._worldManagement;
      component.layerIndex = layerIndex++;
      if (component.isPrefab) {
        this.prefabs.push(component);
      } else {
        const entity: EntitySult = component.output();
        this._worldManagement.addEntity(entity);
      }
    }
    this._worldManagement.bootstrapCompleted();
    this.bootstrapDone(simpleCamera);
  }

  protected onDraw() {}
  protected onUpdate() {}

  mouseMove() {
    this._worldManagement.iterateEntities((entity) => {
      entity.onMouseMove();
    });
  }

  mousePressed() {
    this._worldManagement.iterateEntities((entity) => {
      entity.onMousePressed();
    });
  }

  mouseRelease() {
    this._worldManagement.iterateEntities((entity) => {
      entity.onMouseRelease();
    });
  }

  action() {
    if (Renderer.running && Renderer.isForeground) {
      this.onUpdate();
      this._worldManagement.update();
    }

    Renderer.background(41, 41, 41);
    this.onDraw();
    this._worldManagement.draw();
  }
}
