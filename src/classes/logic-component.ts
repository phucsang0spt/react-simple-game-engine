import { Initializer } from "../export-interfaces";
import { Configurable, Configuration } from "../export-types";
import { Entity } from "./entities/entity";

import { EntitySuit } from "./entities/entity-suit";
import { WorldManagement } from "./world-management";

export class LogicComponent<C extends Initializer = Initializer> {
  private _worldManagement: WorldManagement;
  layerIndex: number = 0;
  constructor(
    private readonly configurable: Configurable<C>,
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
  } & Configuration<C> = {}) {
    const configurable = this.configurable;
    const [Class, params = {}] = Array.isArray(configurable)
      ? configurable
      : [configurable];
    const c = new Class();

    if (worldManagement) {
      this.worldManagement = worldManagement;
    }

    if (c instanceof EntitySuit) {
      c["_layerIndex"] = this.layerIndex; // use _layerIndex to not trigger change index process at this step
      c.preInitial(this._worldManagement);
    }
    if (c instanceof Entity) {
      const { transform, bodyOptions, props, ...restParams } =
        params as Configuration<Entity>;
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
