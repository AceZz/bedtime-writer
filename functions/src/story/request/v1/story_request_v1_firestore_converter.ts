import {
  getFirestore,
  Firestore,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { StoryRequestV1 } from "./story_request_v1";
import { StoryRequestFirestoreConverter } from "../story_request_firestore_converter";
import { StoryRequestStatus } from "../story_request_status";

/**
 * Schema:
 *
 * requests_v1/
 *   <request_id>
 *     author
 *     logic
 *     timestamp
 *     data = [StoryRequest fields]
 */
export class StoryRequestV1FirestoreConverter
  implements StoryRequestFirestoreConverter<StoryRequestV1>
{
  private firestore: Firestore;

  constructor() {
    this.firestore = getFirestore();
  }

  async get(id: string): Promise<StoryRequestV1> {
    const raw = await this.requestRef(id).get();

    const logic = raw.get("logic");
    const data = raw.get("data");

    return new StoryRequestV1(logic, data);
  }

  async write(request: StoryRequestV1): Promise<string> {
    const payload = {
      author: request.author,
      logic: request.logic,
      timestamp: Timestamp.now(),
      data: request.data,
      status: StoryRequestStatus.PENDING,
    };

    const document = await this.requestsRef.add(payload);
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
}
