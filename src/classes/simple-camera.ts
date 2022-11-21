type PositionChangeListener = (x: number, y: number) => void;

export class SimpleCamera {
  private _x: number = 0;
  private _y: number = 0;
  private readonly positionChangeListeners: PositionChangeListener[] = [];

  constructor() {}

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  set x(_x: number) {
    this._x = _x;
    this.emitPositionChangeEvent();
  }

  set y(_y: number) {
    this._y = _y;
    this.emitPositionChangeEvent();
  }

  private emitPositionChangeEvent() {
    const listeners = this.positionChangeListeners;
    for (const listener of listeners) {
      listener(this._x, this._y);
    }
  }

  addPositionChangeListener(func: PositionChangeListener) {
    const listeners = this.positionChangeListeners;
    listeners.push(func);
    return () => {
      const index = listeners.indexOf(func);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
}
