import { Scene } from "./scene";

export type SceneClass = { new (): Scene; tag?: string };
type ChangeSceneListener = (scene: Scene) => void;

export class SceneManagement {
  private _currentScene: Scene;
  private changeSceneListener: ChangeSceneListener;
  static getTag(Scene: SceneClass) {
    return Scene.tag;
  }

  constructor(private Scenes: SceneClass[]) {
    this._currentScene = new Scenes[0]();
    this._currentScene.manager = this;
  }

  get currentScene() {
    return this._currentScene;
  }

  onChangeScene(func: ChangeSceneListener) {
    this.changeSceneListener = func;
  }

  canNext() {
    const currentIndex = this.Scenes.findIndex(
      (Scene) => this._currentScene instanceof Scene
    );
    const NextScene = this.Scenes[currentIndex + 1];
    return !!NextScene;
  }

  next() {
    const currentIndex = this.Scenes.findIndex(
      (Scene) => this._currentScene instanceof Scene
    );
    const NextScene = this.Scenes[currentIndex + 1];
    if (NextScene) {
      if (this._currentScene) {
        this._currentScene.destructor();
      }
      this.startScene(NextScene);
    }
  }

  replay() {
    this.gotoScene(this._currentScene.tag);
  }

  gotoScene(tag: string) {
    for (const Scene of this.Scenes) {
      const _tag = SceneManagement.getTag(Scene);
      if (_tag === tag) {
        if (this._currentScene) {
          this._currentScene.destructor();
        }
        this.startScene(Scene);
        break;
      }
    }
  }

  private startScene(Scene: SceneClass) {
    this._currentScene = new Scene();
    this._currentScene.manager = this;
    this.changeSceneListener?.(this._currentScene);
  }
}
