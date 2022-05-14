export class LogicComponent<C extends { initial: any } = IEntity> {
  private instance: C;
  constructor(configale: Configable<C>) {
    const [Class, params] = Array.isArray(configale) ? configale : [configale];
    const c = new Class();
    c.initial(params);
    this.instance = c;
  }

  output() {
    return this.instance;
  }
}
