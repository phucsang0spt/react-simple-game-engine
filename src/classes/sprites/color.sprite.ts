import { Color } from "../../export-types";
import { RectEntity } from "../entities/rect.entity";
import { Sprite } from "./sprite";

export class ColorSprite extends Sprite<Color> {
  constructor() {
    super();
    this.source = [255, 255, 255];
  }
  onDraw() {
    if (this.animation) {
      this.animation.draw();
    } else {
      Renderer.fill(...this.source);
    }
    if ((this.entity as RectEntity).width != null) {
      Renderer.rect(0, 0, this.width, this.height);
    } else {
      Renderer.circle(0, 0, this.width);
    }
  }
}
