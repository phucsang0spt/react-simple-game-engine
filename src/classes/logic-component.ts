import { Initialler } from "../export-interfaces";
import { Configable } from "../export-types";
import { copyProperties } from "../utils";

export class LogicComponent<C extends Initialler = Initialler> {
  private instance: C;
  constructor(configale: Configable<C>) {
    const [Class, params] = Array.isArray(configale) ? configale : [configale];
    const c = new Class();
    c.initial(params as any);
    this.instance = c;
  }

  output(extraParams: Record<string, any> = {}) {
    copyProperties(this.instance, extraParams);
    return this.instance;
  }
}
