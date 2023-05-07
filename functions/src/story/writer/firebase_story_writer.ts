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

  private async writePartImage(image?: Buffer): Promise<string> {
    const payload = {
      data: image,
    };
    const document = await this.imagesRef.add(payload);

    return document.id;
  }

  private async writePartData(
    part: StoryPart,
    imageId: string
  ): Promise<string> {
    const payload = {
      text: part.text,
      image: imageId,
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
      imagePrompt: part.imagePrompt,
      imagePromptPrompt: part.imagePromptPrompt,
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
