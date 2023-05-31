import {
  getFirestore,
  Firestore,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { StoryRequestV1, StoryRequestV1Data } from "./story_request_v1";
import { StoryRequestFirestoreConverter } from "../story_request_firestore_converter";
import { StoryStatus } from "../../story_status";

/**
 * Schema:
 *
 * stories/
 *   <story_id>:
 *     request/
 *       v1:
 *         logic
 *         [StoryRequest fields]
 *     author
 *     timestamp
 *     status
 */
export class StoryRequestV1FirestoreConverter
  implements StoryRequestFirestoreConverter<StoryRequestV1>
{
  private firestore: Firestore;

  constructor() {
    this.firestore = getFirestore();
  }

  async get(id: string): Promise<StoryRequestV1> {
    const dataDocument = await this.storyRequestRef(id).get();

    const logic = dataDocument.get("logic");
    const data: StoryRequestV1Data = {
      author: dataDocument.get("author"),
      duration: dataDocument.get("duration"),
      style: dataDocument.get("style"),
      characterName: dataDocument.get("characterName"),
      place: dataDocument.get("place"),
      object: dataDocument.get("object"),
      characterFlaw: dataDocument.get("characterFlaw"),
      characterPower: dataDocument.get("characterPower"),
      characterChallenge: dataDocument.get("characterChallenge"),
    };

    return new StoryRequestV1(logic, data);
  }

  async write(request: StoryRequestV1): Promise<string> {
    const payload = {
      author: request.author,
      timestamp: Timestamp.now(),
      status: StoryStatus.PENDING,
    };
    const document = await this.storiesRef.add(payload);
    const documentId = document.id;

    const dataPayload = {
      ...request.data,
      logic: request.logic,
    };
    await this.storyRequestRef(documentId).set(dataPayload);

    return document.id;
  }

  private storyRequestRef(id: string): DocumentReference {
    return this.storyRef(id).collection("request").doc("v1");
  }

  private storyRef(id: string): DocumentReference {
    return this.storiesRef.doc(id);
  }

  private get storiesRef(): CollectionReference {
    return this.firestore.collection("stories");
  }
}
