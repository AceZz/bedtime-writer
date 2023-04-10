export class StoryMetadata {
  author: string;
  title: string;
  isFavorite = false;

  constructor(author: string, title: string) {
    this.author = author;
    this.title = title;
  }
}
