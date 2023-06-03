import {
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import {
  BucketRateLimiterEntry,
  BucketRateLimiterStorage,
} from "./bucket_rate_limiter_storage";

/**
 * Implementation of `BucketRateLimiterStorage` for Firestore.
 *
 * The Firestore document has the following schema:
 *
 * rate_limiter/
 *  <uid>:
 *   <bucket>Tokens
 *   <bucket>LastUpdate
 */
export class FirestoreBucketRateLimiterStorage
  implements BucketRateLimiterStorage
{
  private firestore: Firestore;

  constructor(firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  async readEntries(
    uid: string,
    buckets: string[]
  ): Promise<Map<string, BucketRateLimiterEntry>> {
    const document = await this.userLimitsRef(uid).get();
    const data = document.data() ?? {};

    const entries = new Map();
    for (const bucket of buckets) {
      const tokens = data[`${bucket}Tokens`];
      const timestamp = data[`${bucket}LastUpdate`];

      if (tokens !== undefined && timestamp !== undefined) {
        const entry = new BucketRateLimiterEntry(
          uid,
          bucket,
          tokens,
          timestamp.toDate()
        );
        entries.set(bucket, entry);
      }
    }

    return entries;
  }

  async writeEntries(uid: string, tokens: Map<string, number>): Promise<void> {
    const document = this.userLimitsRef(uid);

    const data: { [key: string]: number | Date } = {};
    for (const [bucket, token] of tokens) {
      data[`${bucket}Tokens`] = token;
      data[`${bucket}LastUpdate`] = new Date();
    }

    await document.set(data);
  }

  private userLimitsRef(uid: string): DocumentReference {
    return this.firestore.collection("rate_limiter").doc(uid);
  }
}
