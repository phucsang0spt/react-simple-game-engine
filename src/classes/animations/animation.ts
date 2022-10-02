import { AnimationInitialParams } from "../../export-types";
export abstract class AnimationSprite {
  protected currentFrame: number = 0;
  protected _isRunning = true;
  protected timeCounter = 0;

  private timePerFrame = 200;

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