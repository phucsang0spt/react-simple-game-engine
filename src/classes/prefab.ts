import { Configurable } from "../export-types";
import { EntitySuit } from "./entities/entity-suit";

import { LogicComponent } from "./logic-component";

export class Prefab<
  C extends EntitySuit = EntitySuit
> extends LogicComponent<C> {
  constructor(configurable: Configurable<C>) {
    super(configurable, true);
  }
}
