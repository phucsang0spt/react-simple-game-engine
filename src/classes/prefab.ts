import { Configable } from "../export-types";
import { EntitySult } from "./entities/entity-sult";

import { LogicComponent } from "./logic-component";

export class Prefab<
  C extends EntitySult = EntitySult
> extends LogicComponent<C> {
  constructor(configale: Configable<C>) {
    super(configale, true);
  }
}
