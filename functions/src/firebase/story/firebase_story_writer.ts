import {
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import {
  StoryMetadata,
  StoryPart,
  StoryWriter,
  StoryStatus,
  StoryLogic,
  ImageApi,
  StoryRegenImageStatus,
  TextApi,
  NPartStoryGenerator,
} from "../../story";
import { valueOrNull } from "../../utils";
import { FirestoreStories } from "./firestore_stories";
import { logger } from "../../logger";
import { FirebaseStoryReader } from "./firebase_story_reader";

export class FirebaseStoryWriter extends StoryWriter {
  private partIds: string[] = [];
  /**
   * Cache the document IDs of already inserted images. This way, an image can
   * be written once, but referenced multiple times.
   */
  private imageIds: Map<Buffer, string> = new Map();
  protected readonly reader: FirebaseStoryReader;

  constructor(
    private readonly stories: FirestoreStories,
    protected readonly id: string | undefined = undefined,
    reader?: FirebaseStoryReader
  ) {
    super(id);
    this.reader = reader ?? new FirebaseStoryReader(stories);
  }

  protected async writeInitMetadata(metadata: StoryMetadata): Promise<string> {
    const data = {
      partIds: [],
      request: metadata.request,
      status: StoryStatus.PENDING,
      createdAt: Timestamp.now(),
      user: metadata.user,
    };
    const document = await this.stories.storiesRef().add(data);
    return document.id;
  }

  protected async writeTitle(title: string): Promise<void> {
    await this.storyRef.update({ title: title });
  }

  protected async writeLogic(logic: StoryLogic): Promise<void> {
    // Firestore does not handle `undefined`, convert them to `null`.
    const logicJson = logic.toJson();
    const logicJsonWithNull: { [key: string]: string | number | null } = {};
    for (const key in logicJson) {
      logicJsonWithNull[key] = valueOrNull(logicJson[key]);
    }

    await this.storyRef.update({ logic: logicJsonWithNull });
  }

  protected async deleteParts(): Promise<void> {
    await this.stories.firestore.recursiveDelete(this.imagesRef);
    await this.stories.firestore.recursiveDelete(this.partsRef);
    this.partIds = [];
    await this.stories.firestore.recursiveDelete(this.promptsRef);
    this.imageIds.clear();
  }

  protected async writePart(part: StoryPart): Promise<string> {
    const imageId = await this.writePartImage(part.image);
    const partId = await this.writePartData(part, imageId);
    this.partIds.push(partId);

    await Promise.all([
      this.updateStory(),
      this.writePartPrompts(part, partId),
    ]);

    return partId;
  }

  private async writePartImage(image?: Buffer): Promise<string | undefined> {
    if (image === undefined) {
      return undefined;
    }

    const data = {
      data: image,
      isApproved: false,
      regenStatus: StoryRegenImageStatus.IDLE,
    };
    const imageId = this.imageIds.get(image);

    // Already existing image: return it.
    if (imageId !== undefined) {
      return imageId;
    }

    // New image: insert it first.
    const document = await this.imagesRef.add(data);
    this.imageIds.set(image, document.id);
    return document.id;
  }

  private async writePartData(
    part: StoryPart,
    imageId: string | undefined
  ): Promise<string> {
    const data = {
      text: part.text,
      image: valueOrNull(imageId),
    };
    const document = await this.partsRef.add(data);

    return document.id;
  }

  private async updateStory() {
    await this.storyRef.update({
      partIds: this.partIds,
      status: StoryStatus.GENERATING,
    });
  }

  private async writePartPrompts(
    part: StoryPart,
    partId: string
  ): Promise<string> {
    const data = {
      textPrompt: part.textPrompt,
      imagePrompt: valueOrNull(part.imagePrompt),
      imagePromptPrompt: valueOrNull(part.imagePromptPrompt),
    };
    await this.promptsRef.doc(partId).set(data);

    return partId;
  }

  protected async writeStatusComplete(): Promise<void> {
    await this.storyRef.update({ status: StoryStatus.COMPLETE });
    logger.info(
      `FirebaseStoryWriter: story ${this.storyIdOrThrow} was generated ` +
        "and added to Firestore."
    );
  }

  protected async writeStatusError(error: unknown): Promise<void> {
    await this.storyRef.update({ status: StoryStatus.ERROR });
    logger.error(
      `FirebaseStoryWriter: story ${this.storyIdOrThrow} ` +
        ` encountered an error: ${error}.`
    );
  }

  async delete(storyId: string) {
    await this.stories.storyRef(storyId).delete();
  }

  async regenImage(
    storyId: string,
    imageId: string,
    textApi: TextApi,
    imageApi: ImageApi
  ): Promise<void> {
    try {
      await this.setRegenImageStatus(
        storyId,
        imageId,
        StoryRegenImageStatus.PENDING
      );

      const logic = await this.reader.getClassicStoryLogic(storyId);
      const generator = new NPartStoryGenerator(
        logic,
        textApi, // Won't be used in that function.
        textApi,
        imageApi
      );

      const storyParts = await this.reader.getStoryParts(storyId);
      const storyText = Array.from(storyParts.values())
        .map((part) => part.text)
        .join("\n");

      const [newImagePrompt, newImage] =
        await generator.getImagePromptThenImage(storyText);

      // Assume we replace the image of the first part.
      const partId = Array.from(storyParts.keys())[0];

      await this.replaceImage(storyId, imageId, newImage);
      await this.replaceImagePrompt(storyId, partId, newImagePrompt);
      await this.setRegenImageStatus(
        storyId,
        imageId,
        StoryRegenImageStatus.COMPLETE
      );
    } catch (error) {
      await this.setRegenImageStatus(
        storyId,
        imageId,
        StoryRegenImageStatus.ERROR
      );
      logger.error(`regenImage: ${error}`);
    }
  }

  async replaceImage(storyId: string, imageId: string, image: Buffer) {
    const imageRef = this.stories.imageRef(storyId, imageId);

    const imageData = (await imageRef.get()).data()?.data;

    if (imageData === undefined || imageData === null) {
      throw new Error(
        `replaceImage: no current image data found for story ${storyId} and image ${imageId}`
      );
    }

    await imageRef.set({ data: image, isApproved: false });
  }

  private async replaceImagePrompt(
    storyId: string,
    partId: string,
    newImagePrompt: string
  ) {
    const promptsDocRef = this.stories.promptsDocRef(storyId, partId);

    const imagePrompt = (await promptsDocRef.get()).data()?.imagePrompt;

    if (imagePrompt === undefined || imagePrompt === null) {
      throw new Error(
        `replaceImagePrompt: no current image prompt found for story ${storyId} and partId ${partId}`
      );
    }

    await promptsDocRef.update({ imagePrompt: newImagePrompt });
  }

  private async setRegenImageStatus(
    storyId: string,
    imageId: string,
    status: string
  ): Promise<void> {
    const imageRef = this.stories.imageRef(storyId, imageId);

    await imageRef.update({ regenStatus: status });
  }

  async approveImage(storyId: string, imageId: string): Promise<void> {
    const imageRef = this.stories.imageRef(storyId, imageId);

    const imageData = (await imageRef.get()).data()?.data;

    if (imageData === undefined || imageData === null) {
      throw new Error(
        `approveImage: no image found for story ${storyId} and image ${imageId}`
      );
    }

    await imageRef.update({ isApproved: true });
  }

  private get storyRef(): DocumentReference {
    return this.stories.storyRef(this.storyIdOrThrow);
  }

  private get imagesRef(): CollectionReference {
    return this.stories.imagesRef(this.storyIdOrThrow);
  }

  private get partsRef(): CollectionReference {
    return this.stories.partsRef(this.storyIdOrThrow);
  }

  private get promptsRef(): CollectionReference {
    return this.stories.promptsRef(this.storyIdOrThrow);
  }

  private get storyIdOrThrow(): string {
    if (this.id === undefined) {
      throw new Error(
        "FirebaseStoryWriter: `id` is not set, have you called " +
          "`this.writeInit()`?"
      );
    }
    return this.id;
  }
}
