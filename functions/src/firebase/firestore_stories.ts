import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";

export interface FirestoreStories {
  storyRef(id: string): DocumentReference;
  storiesRef(): CollectionReference;
  deleteStory(id: string): Promise<void>;
}
