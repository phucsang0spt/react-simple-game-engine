import { Initialler } from "../export-interfaces";
import { Configable, Configation } from "../export-types";
import { Entity } from "./entities/entity";

import { EntitySult } from "./entities/entity-sult";
import { WorldManagement } from "./world-management";

export class LogicComponent<C extends Initialler = Initialler> {
  private _worldManagement: WorldManagement;
  layerIndex: number = 0;
  constructor(
    private readonly configale: Configable<C>,
    private readonly _isPrefab?: boolean
  ) {}

  get isPrefab() {
    return this._isPrefab;
  }

  set worldManagement(_worldManagement: WorldManagement) {
    if (this._worldManagement) {
      console.warn("Cant change worldManagement");
    } else {
      this._worldManagement = _worldManagement;
    }
  }

  output({
    worldManagement,
    ...targetParams
  }: {
    worldManagement?: WorldManagement;
  } & Configation<C> = {}) {
    const configale = this.configale;
    const [Class, params = {}] = Array.isArray(configale)
      ? configale
      : [configale];
    const c = new Class();

    if (worldManagement) {
      this.worldManagement = worldManagement;
    }

    if (c instanceof EntitySult) {
      c["_layerIndex"] = this.layerIndex; // use _layerIndex to not trigger change index process at this step
      c.preInitial(this._worldManagement);
    }
    if (c instanceof Entity) {
      const { transform, bodyOptions, props, ...restParams } =
        params as Configation<Entity>;
      const {
        transform: extraTransform,
        bodyOptions: extraBodyOptions,
        props: extraProps,
        ...extraRestParams
      } = targetParams;
      c.initial({
        transform: {
          ...transform,
          ...extraTransform,
        },
        bodyOptions: {
          ...bodyOptions,
          ...extraBodyOptions,
        },
        props: {
          ...props,
          ...extraProps,
        },
        ...restParams,
        ...extraRestParams,
      });
    } else {
      c.initial({ ...params, ...targetParams });
    }
    return c;
  }
}
