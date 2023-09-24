/**
 * Interface to manage the users' stories.
 */
export interface UserStoriesManager {
  /**
   * Add the cache storyId to the user's stories.
   *
   * storyId is the id of the created doc.
   */
  addCacheStory(uid: string, storyId: string): Promise<void>;

  /**
   * Read the cache `storyId`s for the user.
   *
   * Returns an empty list in case no cache story ids are
   * found for this user.
   */
  readCacheStoryIds(uid: string): Promise<string[]>;
}
