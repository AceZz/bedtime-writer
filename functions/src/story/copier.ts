export type CopierFilter<I, T> = (item: I) => T;

export type CopierParams = {
  ids?: string[];
};

export abstract class Copier<I, T> {
  protected abstract get itemFilter(): CopierFilter<I, T>;

  protected filterItems(items: Map<string, I>): Map<string, T> {
    const map = new Map();
    for (const [key, item] of items.entries()) {
      map.set(key, this.itemFilter(item));
    }
    return map;
  }

  /**
   * Copy items from one location to another.
   *
   * If `ids` is provided, only copy those.
   */
  abstract copy(params?: CopierParams): Promise<void>;
}
