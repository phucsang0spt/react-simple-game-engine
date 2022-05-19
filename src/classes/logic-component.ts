import { Initialler } from "../export-interfaces";
import { Configable } from "../export-types";

import { copyProperties } from "../utils";

import { EntitySult } from "./entities/entity-sult";
import { WorldManagement } from "./world-management";

export class LogicComponent<C extends Initialler = Initialler> {
  constructor(private configale: Configable<C>) {}
  output({
    worldManagement,
    ...extraParams
  }: { worldManagement?: WorldManagement } & Record<string, any> = {}) {
    const configale = this.configale;
    const [Class, params = {}] = Array.isArray(configale)
      ? configale
      : [configale];
    const c = new Class();
    if (c instanceof EntitySult && worldManagement) {
      c.preInitial(worldManagement);
    }
    c.initial(params as any);
    copyProperties(c, extraParams);
    return c;
  }
}
