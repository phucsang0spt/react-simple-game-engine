import p5 from "p5";

type ItemWithPercent<I> = [I, number];
type LastItem<I> = [I];

export type Collection<I> = [...ItemWithPercent<I>[], LastItem<I>];

export class P5 extends p5 {
  constructor(sketch: (p5: P5) => void) {
    super(sketch);
    window.Renderer = this;
  }

  choose<I = any>(collection: Collection<I>): I {
    const lastItem = collection[collection.length - 1];
    const restItems = collection.slice(0, collection.length - 1);

    let totalPercentsOfRestItems = (restItems as ItemWithPercent<I>[]).reduce(
      (t, item) => {
        return t + item[1];
      },
      0
    );
    if (totalPercentsOfRestItems > 1) {
      const overmax = totalPercentsOfRestItems - 1;
      const avg = 1 / restItems.length;
      for (const item of restItems) {
        if (item[1]! > avg) {
          item[1]! -= overmax;
        }
      }
      totalPercentsOfRestItems = 1;
    }
    lastItem[1] = 1 - totalPercentsOfRestItems;

    const items: I[] = [];
    for (const [item, percent] of collection) {
      Array.from({ length: Math.round(percent! * 10) }).forEach(() => {
        items.push(item);
      });
    }
    this.shuffle(items, true);
    console.log("Collection generated: ", items);
    return this.random(items);
  }
}
