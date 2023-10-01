import { Copier, CopierFilter, CopierParams } from "../../story";
import { dumpCollection, dumpToCollection } from "../firestore_utils";
import { FirestoreStories } from "./firestore_stories";

export class FirebaseStoryCopier<
  T extends { [key: string]: any }
> extends Copier<any, T> {
  constructor(
    protected readonly itemFilter: CopierFilter<any, T>,
    private readonly origin: FirestoreStories,
    private readonly dest: FirestoreStories
  ) {
    super();
  }

  async copy(params?: CopierParams | undefined): Promise<void> {
    const stories = await dumpCollection(this.origin, params?.ids);
    const filteredStories = this.filterItems(stories);
    return dumpToCollection(this.dest, filteredStories);
  }
}
