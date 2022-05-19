import { Initialler } from "../export-interfaces";
import { Configable } from "../export-types";

import { copyProperties } from "../utils";

import { EntitySult } from "./entities/entity-sult";
import { WorldManagement } from "./world-management";

export class LogicComponent<C extends Initialler = Initialler> {
  private _worldManagement?: WorldManagement;

  constructor(private configale: Configable<C>) {}

  set worldManagement(worldManagement: WorldManagement) {
    if (!this._worldManagement) {
      this._worldManagement = worldManagement;
    } else {
      console.warn("Can not change world");
    }
  }

  output(extraParams: Record<string, any> = {}) {
    const configale = this.configale;
    const [Class, params = {}] = Array.isArray(configale)
      ? configale
      : [configale];
    const c = new Class();
    if (c instanceof EntitySult && this._worldManagement) {
      c.preInitial(this._worldManagement);
    }
    c.initial(params as any);
    copyProperties(c, extraParams);
    return c;
  }
}
