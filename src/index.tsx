export { createAssetImage, createAssetSound } from "./utils";

export { AnimationSprite } from "./classes/animations/animation";
export { AvatarAnimationSprite } from "./classes/animations/avatar.animation";
export { ColorAnimationSprite } from "./classes/animations/color.animation";

export { Entity } from "./classes/entities/entity";
export { CircleEntity } from "./classes/entities/circle.entity";
export { RectEntity } from "./classes/entities/rect.entity";

export { LogicComponent } from "./classes/logic-component";

export { Sprite } from "./classes/sprites/sprite";
export { AvatarSprite } from "./classes/sprites/avatar.sprite";
export { ColorSprite } from "./classes/sprites/color.sprite";

export { Scene } from "./classes/scene";

export { EntityTag } from "./decorators/entity-tag.decor";
export { SceneTag } from "./decorators/scene-tag.decor";
export { SceneUI } from "./decorators/scene-ui.decor";

export { ScenesProcess } from "./ui-components/ScenesProcess";

export * from "./export-types";

export { default as Matter } from "matter-js";
