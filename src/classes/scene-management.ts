import { Scene } from "./scene";

type ChangeSceneListener = (scene: Scene) => void;
export class SceneManagement {
  private _currentScene!: Scene;
  private changeSceneListener!: ChangeSceneListener;
  static getTag(Scene: { tag?: string }) {
    return Scene.tag;
  }

  constructor(private Scenes: { new (): Scene; tag?: string }[]) {
    this._currentScene = new Scenes[0]();
    this._currentScene.manager = this;
  }

  get currentScene() {
    return this._currentScene;
  }

  onChangeScene(func: ChangeSceneListener) {
    this.changeSceneListener = func;
  }

  gotoScene(tag: string) {
    for (const Scene of this.Scenes) {
      const _tag = SceneManagement.getTag(Scene);
      if (_tag === tag) {
        if (this._currentScene) {
          this._currentScene.destructor();
        }
        this._currentScene = new Scene();
        this._currentScene.manager = this;
        this.changeSceneListener?.(this._currentScene);
        break;
      }
    }
  }
}
