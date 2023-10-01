import { describe, expect, test } from "@jest/globals";
import { listToMapById } from "../../src/utils";
import { Copier, CopierParams } from "../../src/story/copier";

class Dummy {
  constructor(public id: string, public x: number) {}
}

const DUMMIES = listToMapById<string, Dummy>([
  new Dummy("0", 0),
  new Dummy("1", 1),
]);

/**
 * Dummy implementation to test the methods of the base class.
 */
class DummyCopier<T extends { [key: string]: any }> extends Copier<Dummy, T> {
  constructor(protected readonly itemFilter: (item: Dummy) => T) {
    super();
  }

  publicFilterItems = this.filterItems;

  copy(params?: CopierParams): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

describe("DummyCopier", () => {
  test("filterItems identity", () => {
    const identityCopier = new DummyCopier<Dummy>((d: Dummy) => d);

    expect(identityCopier.publicFilterItems(DUMMIES)).toEqual(DUMMIES);
  });

  test("filterItems just one field", () => {
    const copier = new DummyCopier((d: Dummy) => {
      return { x: d.x };
    });

    expect(copier.publicFilterItems(DUMMIES)).toEqual(
      new Map([
        ["0", { x: 0 }],
        ["1", { x: 1 }],
      ])
    );
  });

  test("filterItems nested", () => {
    const copier = new DummyCopier((d: Dummy) => {
      return {
        nested: [d.x, d.x],
      };
    });

    expect(copier.publicFilterItems(DUMMIES).get("0")?.nested).toEqual([0, 0]);
  });
});
