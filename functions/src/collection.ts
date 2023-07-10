export type RootCollectionPath = { collection: string };
export type SubCollectionPath = {
  collection: string;
  docId: string;
  subcollection: string;
};
export type CollectionPath = RootCollectionPath | SubCollectionPath;
