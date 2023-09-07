import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
  FirebaseStoryCopier,
  dumpCollection,
} from "../../../src/firebase";
import { FirestoreContextUtils } from "../utils";
import { CLASSIC_LOGIC_0, GENERATOR_0, METADATA_0 } from "../../story/data";

const origin = new FirestoreContextUtils("firebase_story_copier_origin")
  .storyRealtime;
const dest = new FirestoreContextUtils("firebase_story_copier_dest")
  .storyRealtime;

describe("FirebaseStoryCopier", () => {
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await origin.delete();
    await dest.delete();
  });

  test("copy() all", async () => {
    const writer_0 = new FirebaseStoryWriter(origin);
    await writer_0.writeInit(METADATA_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(origin);
    await writer_1.writeInit(METADATA_0);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const copier = new FirebaseStoryCopier((story) => story, origin, dest);
    await copier.copy();

    expect(await dumpCollection(dest)).toEqual(await dumpCollection(origin));
  });

  test("copy() ids", async () => {
    const writer_0 = new FirebaseStoryWriter(origin);
    const id = await writer_0.writeInit(METADATA_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(origin);
    await writer_1.writeInit(METADATA_0);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const copier = new FirebaseStoryCopier((story) => story, origin, dest);
    await copier.copy({ ids: [id] });

    const all = await dumpCollection(origin);
    const expected = new Map([[id, all.get(id)]]);

    expect(await dumpCollection(dest)).toEqual(expected);
  });

  test("copy() filtered", async () => {
    const writer_0 = new FirebaseStoryWriter(origin);
    const id = await writer_0.writeInit(METADATA_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(origin);
    await writer_1.writeInit(METADATA_0);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const copier = new FirebaseStoryCopier(
      (story) => {
        return {
          request: story.request,
          title: story.title,
          parts: story.parts,
        };
      },
      origin,
      dest
    );
    await copier.copy({ ids: [id] });

    const expected = await dumpCollection(origin);
    const expectedStory = expected.get(id)! as any;

    const actual = await dumpCollection(dest);
    expect(actual.size).toBe(1);
    const actualStory = actual.get(id)! as any;

    expect(actualStory.request).toEqual(expectedStory.request);
    expect(actualStory.title).toBe(expectedStory.title);
    expect(actualStory.parts).toEqual(expectedStory.parts);
  });
});
