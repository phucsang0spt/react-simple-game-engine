import { LayoutMode } from "../export-enums";
import { Size } from "../export-types";
import { copyProperties } from "../utils";

export class Scaler {
  private _value: number;
  private _screenSize: Size;

  constructor(
    private readonly _screenSizeUI: Size,
    private readonly _canvasSize: Size,
    private _layoutMode: LayoutMode
  ) {
    this.update();
  }

  get value() {
    return this._value;
  }

  get layoutMode() {
    return this._layoutMode;
  }

  get canvasSize() {
    return this._canvasSize;
  }

  get screenSize() {
    return this._screenSize;
  }

  get screenSizeUI() {
    return this._screenSizeUI;
  }

  set value(_value: number) {
    this._value = _value;
    this._screenSize = {
      width: this.screenUnitToCanvasUnit(this._screenSizeUI.width),
      height: this.screenUnitToCanvasUnit(this._screenSizeUI.height),
    };
  }

  set screenSizeUI(_screenSizeUI: Size) {
    copyProperties(this._screenSizeUI, _screenSizeUI);
    this.update();
  }

  set canvasSize(_canvasSize: Size) {
    copyProperties(this._canvasSize, _canvasSize);
    this.update();
  }

  set layoutMode(_layoutMode: LayoutMode) {
    this._layoutMode = _layoutMode;
    this.update();
  }

  get viewport() {
    const _viewport = { width: 1, height: 1 };
    if (this._canvasSize.height > this._screenSize.height) {
      _viewport.height = this._screenSize.height;
    } else {
      _viewport.height = this._canvasSize.height;
    }
    if (this._canvasSize.width > this._screenSize.width) {
      _viewport.width = this._screenSize.width;
    } else {
      _viewport.width = this._canvasSize.width;
    }
    return _viewport;
  }

  screenUnitToCanvasUnit(px: number) {
    return px / this._value;
  }

  private update() {
    if (this._layoutMode === LayoutMode.LANDSCAPE) {
      const predictScale = this._screenSizeUI.width / this._canvasSize.width;
      if (predictScale * this._canvasSize.height >= this._screenSizeUI.height) {
        this.value = predictScale;
      } else {
        this.value = this._screenSizeUI.height / this._canvasSize.height;
      }
    } else {
      const predictScale = this._screenSizeUI.height / this._canvasSize.height;
      if (predictScale * this._canvasSize.width >= this._screenSizeUI.width) {
        this.value = predictScale;
      } else {
        this.value = this._screenSizeUI.width / this._canvasSize.width;
      }
    }
  }
}
