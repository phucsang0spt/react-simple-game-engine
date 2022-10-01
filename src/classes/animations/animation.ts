import { AnimationInitialParams } from "../../export-types";
import { Sprite } from "../sprites/sprite";
export abstract class AnimationSprite<S extends Sprite<any>> {
  protected currentFrame: number = 0;
  protected _isRunning = true;
  protected timeCounter = 0;

  private _sprite: S;
  private timePerFrame = 200;

  get sprite() {
    return this._sprite;
  }

  set isRunning(_isRunning: boolean) {
    this._isRunning = _isRunning;
    if (!_isRunning) {
      // stop
      this.timeCounter = 0;
      this.currentFrame = 0;
    }
  }

  abstract initial(params: AnimationInitialParams): void;

  draw() {
    if (this.checkFrameMax()) {
      this.currentFrame = 0;
    }

    this.onDraw();

    if (this.timeCounter >= this.timePerFrame) {
      this.timeCounter = 0;
      if (this._isRunning) {
        this.currentFrame++;
      }
    }
    this.timeCounter += Renderer.deltaTime;
  }

  protected abstract checkFrameMax(): boolean;
  protected abstract onDraw(): void;
}
