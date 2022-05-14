import { Avatar } from "../../export-types";
import { Sprite } from "./sprite";

export class AvatarSprite extends Sprite<Avatar | undefined | null> {
  onDraw() {
    if (this.sprite) {
      if (this.animation) {
        this.animation.draw();
      } else {
        Renderer.image(
          this.sprite,
          // position on canvas
          0,
          0,
          this.width,
          this.height,
          //crop on source image
          0,
          0,
          this.sprite.width,
          this.sprite.height
        );
      }
    }
  }
}
