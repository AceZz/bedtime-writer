import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";

export interface FirestoreStories {
  storiesRef(): CollectionReference;
  newStoryRef(): DocumentReference;
  storyRef(docId: string): DocumentReference;
}
