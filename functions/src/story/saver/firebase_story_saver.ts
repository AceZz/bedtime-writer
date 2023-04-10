import {
  getFirestore,
  Firestore,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { StoryMetadata } from "../story_metadata";
import { StorySaver } from "./story_saver";
import { StoryPart } from "../story_part";

/**
 * The Firestore document has the following schema:
 *
 * stories/
 *   <story_id>
 *     author
 *     isFavorite
 *     timestamp
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
export class FirebaseStorySaver implements StorySaver {
  metadata: StoryMetadata;

  private firestore: Firestore;
  private id?: string;
  private parts: string[];

  constructor(metadata: StoryMetadata, firestore?: Firestore) {
    this.metadata = metadata;
    this.firestore = firestore ?? getFirestore();
    this.parts = [];
  }

  async createStory(): Promise<string> {
    const payload = {
      author: this.metadata.author,
      isFavorite: this.metadata.isFavorite,
      timestamp: Timestamp.now(),
      title: this.metadata.title,
      parts: [],
    };
    const document = await this.storiesRef.add(payload);

    this.id = document.id;
    return this.id;
  }

  async savePart(part: StoryPart): Promise<string> {
    const imageId = await this.savePartImage(part.image);
    const partId = await this.savePartData(part, imageId);
    this.parts.push(partId);

    await Promise.all([
      this.updateStoryParts(),
      this.savePartPrompts(part, partId),
    ]);

    return partId;
  }

  private async savePartImage(image?: Buffer): Promise<string> {
    const payload = {
      data: image,
    };
    const document = await this.imagesRef.add(payload);

    return document.id;
  }

  private async savePartData(
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

  private async updateStoryParts() {
    await this.storyRef.update({ parts: this.parts });
  }

  private async savePartPrompts(
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

  private get storiesRef(): CollectionReference {
    return this.firestore.collection("stories");
  }

  private get storyRef(): DocumentReference {
    if (this.id === undefined) {
      throw TypeError("FirebaseStorySaver: `createStory` was not called");
    }
    return this.storiesRef.doc(this.id);
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
