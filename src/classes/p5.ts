import p5 from "p5";

type ItemWithPercent<I> = [I, number];
type LastItem<I> = [I];

export type Collection<I> = [...ItemWithPercent<I>[], LastItem<I>];

export class P5 extends p5 {
  choose<I = any>(collection: Collection<I>): I {
    const lastItem = collection[collection.length - 1];
    const restItems = collection.slice(0, collection.length - 1);

    let totalPercentsOfRestItems = (restItems as ItemWithPercent<I>[]).reduce(
      (t, item) => {
        return t + item[1];
      },
      0
    );
    if (totalPercentsOfRestItems > 100) {
      const overmax = totalPercentsOfRestItems - 100;
      const avg = 100 / restItems.length;
      for (const item of restItems) {
        if (item[1]! > avg) {
          item[1]! -= overmax;
        }
      }
      totalPercentsOfRestItems = 100;
    }
    lastItem[1] = 100 - totalPercentsOfRestItems;

    const items: I[] = [];
    for (const [item, percent] of collection) {
      Array.from({ length: Math.round(percent as number) }).forEach((_, i) => {
        items.push(item);
      });
    }
    this.shuffle(items, true);
    console.log("Collection generated: ", items);
    return this.random(items);
  }
}
