import {
  getFirestore,
  Firestore,
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { StoryMetadata } from "../story_metadata";
import { StoryPart } from "../story_part";
import { StoryWriter } from "./story_writer";
import { StoryStatus } from "../story_status";
import { valueOrNull } from "./utils";

/**
 * The Firestore document has the following schema:
 *
 * stories/
 *   <story_id>
 *     author (already set)
 *     isFavorite
 *     status
 *     timestamp (already set)
 *     title
 *     parts = [part1_id, part2_id]
 *     images/
 *       <image_id>
 *         data
 *     parts/
 *       <part_id>
 *         text
 *         image = image_id
 *     prompts
 *       <part_id>
 *         textPrompt
 *         imagePrompt
 *         imagePromptPrompt
 */
export class FirebaseStoryWriter implements StoryWriter {
  private firestore: Firestore;
  private parts: string[];
  /**
   * Cache the document IDs of already inserted images. This way, an image can
   * be written once, but referenced multiple times.
   */
  private imageIds: Map<Buffer, string> = new Map();

  constructor(
    readonly metadata: StoryMetadata,
    private readonly id: string,
    firestore?: Firestore
  ) {
    this.firestore = firestore ?? getFirestore();
    this.parts = [];
  }

  async writeMetadata(): Promise<string> {
    const payload = {
      isFavorite: this.metadata.isFavorite,
      title: this.metadata.title,
      parts: [],
    };
    await this.storyRef.update(payload);
    return this.id;
  }

  async writePart(part: StoryPart): Promise<string> {
    const imageId = await this.writePartImage(part.image);
    const partId = await this.writePartData(part, imageId);
    this.parts.push(partId);

    await Promise.all([
      this.updateStory(),
      this.writePartPrompts(part, partId),
    ]);

    return partId;
  }

  async writeComplete(): Promise<void> {
    await this.storyRef.update({ status: StoryStatus.COMPLETE });
  }

  private async writePartImage(image?: Buffer): Promise<string | undefined> {
    if (image === undefined) {
      return undefined;
    }

    const payload = {
      data: image,
    };
    const imageId = this.imageIds.get(image);

    // Already existing image: return it.
    if (imageId !== undefined) {
      return imageId;
    }

    // New image: insert it first.
    const document = await this.imagesRef.add(payload);
    this.imageIds.set(image, document.id);
    return document.id;
  }

  private async writePartData(
    part: StoryPart,
    imageId: string | undefined
  ): Promise<string> {
    const payload = {
      text: part.text,
      image: valueOrNull(imageId),
    };
    const document = await this.partsRef.add(payload);

    return document.id;
  }

  private async updateStory() {
    await this.storyRef.update({
      parts: this.parts,
      status: StoryStatus.GENERATING,
    });
  }

  private async writePartPrompts(
    part: StoryPart,
    partId: string
  ): Promise<string> {
    const payload = {
      textPrompt: part.textPrompt,
      imagePrompt: valueOrNull(part.imagePrompt),
      imagePromptPrompt: valueOrNull(part.imagePromptPrompt),
    };
    await this.promptsRef.doc(partId).set(payload);

    return partId;
  }

  private get storyRef(): DocumentReference {
    return this.firestore.collection("stories").doc(this.id);
  }

  private get imagesRef(): CollectionReference {
    return this.storyRef.collection("images");
  }

  private get partsRef(): CollectionReference {
    return this.storyRef.collection("parts");
  }

  private get promptsRef(): CollectionReference {
    return this.storyRef.collection("prompts");
  }
}
