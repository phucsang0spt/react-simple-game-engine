import { Entity } from "../classes/entities/entity";

export function EntityTag(tag: string) {
  return function (target: { tag?: string; new (): Entity }) {
    target.tag = tag;
  };
}
