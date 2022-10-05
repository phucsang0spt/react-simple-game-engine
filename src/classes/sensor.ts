import { Color, Point, SensorBody, Size } from "../export-types";
import { Entity } from "./entities/entity";

export class Sensor {
  constructor(
    public readonly entity: Entity,
    public readonly name: string,
    public readonly position: Point,
    public readonly size: Size,
    public readonly shape: "rect" | "circle",
    public readonly body: SensorBody,
    public readonly debug: boolean = false,
    public readonly debugColor: Color = [212, 200, 200, 100]
  ) {
    this.body.sensor = this;
    this.body.entity = this.entity;
  }
}
