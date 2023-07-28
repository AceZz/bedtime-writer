import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";

export interface FirestoreStories {
  storyRef(storyId: string): DocumentReference;
  storiesRef(): CollectionReference;
  storyRequestRef(storyId: string, requestVersion: string): DocumentReference;
}
