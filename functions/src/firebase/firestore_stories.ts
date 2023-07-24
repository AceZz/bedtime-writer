import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";

export interface FirestoreStories {
  storyRequestRef(storyDocId: string): DocumentReference;
  storiesRef(): CollectionReference;
  newStoryRef(): DocumentReference;
  storyRef(storyDocId: string): DocumentReference;
}
