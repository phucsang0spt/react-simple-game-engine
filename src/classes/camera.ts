export class Camera {
  x: number = 0;
  y: number = 0;
  scaleX: number = 1;
  scaleY: number = 1;

  constructor(private _width: number, private _height: number) {}

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  set width(width: number) {
    this._width = width;
    Renderer.resizeCanvas(this._width, this._height);
  }

  set height(height: number) {
    this._height = height;
    Renderer.resizeCanvas(this._width, this._height);
  }
}
