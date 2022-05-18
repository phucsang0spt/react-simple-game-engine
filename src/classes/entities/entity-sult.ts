import { Initialler } from "../../export-interfaces";
import { WorldManagement } from "../world-management";

export abstract class EntitySult<P = any> implements Initialler<P> {
  abstract update(): void;
  abstract draw(): void;
  abstract active(worldManagement: WorldManagement): void;
  initial(params: P) {}
}
