import {
  getFirestore,
  Firestore,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { StoryRequestV1, StoryRequestV1Data } from "./story_request_v1";
import { StoryRequestFirestoreConverter } from "../story_request_firestore_converter";
import { StoryRequestStatus } from "../story_request_status";

/**
 * Schema:
 *
 * requests_v1/
 *   <request_id>:
 *     private/
 *       data:
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
    const dataDocument = await this.requestDataRef(id).get();

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
      status: StoryRequestStatus.PENDING,
    };
    const document = await this.requestsRef.add(payload);
    const documentId = document.id;

    const dataPayload = {
      ...request.data,
      logic: request.logic,
    };
    await this.requestDataRef(documentId).set(dataPayload);

    return document.id;
  }

  async updateStatus(id: string, status: StoryRequestStatus): Promise<void> {
    await this.requestRef(id).update({ status: status });
  }

  private get requestsRef(): CollectionReference {
    return this.firestore.collection("requests_v1");
  }

  private requestRef(id: string): DocumentReference {
    return this.requestsRef.doc(id);
  }

  private requestDataRef(id: string): DocumentReference {
    return this.requestRef(id).collection("private").doc("data");
  }
}
