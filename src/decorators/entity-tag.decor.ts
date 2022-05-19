import { EntitySult } from "../classes/entities/entity-sult";

export function EntityTag(tag: string) {
  return function (target: { tag?: string; new (): EntitySult }) {
    target.tag = tag;
  };
}
