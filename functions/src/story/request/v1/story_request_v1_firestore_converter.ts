import {
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { StoryRequestV1, StoryRequestV1Data } from "./story_request_v1";
import { StoryRequestFirestoreConverter } from "../story_request_firestore_converter";
import { StoryStatus } from "../../story_status";
import { FirestoreStories } from "../../../firebase";

/**
 * Schema:
 *
 * <story collection>/
 *   <story_id>:
 *     request {}
 *     author
 *     timestamp
 *     status
 *     form_id
 */
export class StoryRequestV1FirestoreConverter
  implements StoryRequestFirestoreConverter<StoryRequestV1>
{
  readonly stories: FirestoreStories;

  constructor(stories: FirestoreStories) {
    this.stories = stories;
  }

  async get(id: string): Promise<StoryRequestV1> {
    const storyDoc = await this.storyRef(id).get();

    const logic = storyDoc.get("request.logic");
    const data: StoryRequestV1Data = {
      author: storyDoc.get("request.author"),
      duration: storyDoc.get("request.duration"),
      style: storyDoc.get("request.style"),
      characterName: storyDoc.get("request.characterName"),
      place: storyDoc.get("request.place"),
      object: storyDoc.get("request.object"),
      characterFlaw: storyDoc.get("request.characterFlaw"),
      characterPower: storyDoc.get("request.characterPower"),
      characterChallenge: storyDoc.get("request.characterChallenge"),
    };

    return new StoryRequestV1(logic, data);
  }

  async write(request: StoryRequestV1): Promise<string> {
    const payload = {
      author: request.author,
      timestamp: Timestamp.now(),
      status: StoryStatus.PENDING,
      request: {
        ...request.data,
        logic: request.logic,
        version: request.version,
      },
    };
    const document = await this.storiesRef.add(payload);

    return document.id;
  }

  private storyRef(id: string): DocumentReference {
    return this.storiesRef.doc(id);
  }

  private get storiesRef(): CollectionReference {
    return this.stories.storiesRef();
  }
}
