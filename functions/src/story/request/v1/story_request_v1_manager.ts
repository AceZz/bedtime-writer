import { FirestoreStories } from "../../../firebase";
import { CLASSIC_LOGIC } from "../../logic";
import { StoryRequestManager } from "../story_request_manager";
import { StoryRequestV1 } from "./story_request_v1";
import { StoryRequestV1FirestoreConverter } from "./story_request_v1_firestore_converter";
import { StoryRequestV1JsonConverter } from "./story_request_v1_json_converter";

export class StoryRequestV1Manager
  implements StoryRequestManager<StoryRequestV1>
{
  private firestoreConverter: StoryRequestV1FirestoreConverter;
  readonly jsonConverter: StoryRequestV1JsonConverter;

  constructor(stories: FirestoreStories) {
    this.firestoreConverter = new StoryRequestV1FirestoreConverter(stories);
    this.jsonConverter = new StoryRequestV1JsonConverter();
  }

  async get(id: string): Promise<StoryRequestV1> {
    return this.firestoreConverter.get(id);
  }

  getVersion(): string {
    return "v1";
  }

  create(logic: string, data: object): Promise<string> {
    const request = this.jsonConverter.fromJson(logic, data);
    this.validate(request);

    return this.firestoreConverter.write(request);
  }

  private validate(request: StoryRequestV1) {
    if (request.logic == CLASSIC_LOGIC) {
      const logic = request.toClassicStoryLogic();

      if (!logic.isValid()) {
        throw Error("StoryRequestV1Manager: request is invalid");
      }
    } else {
      throw Error(`StoryRequestV1Manager: unsupported logic ${request.logic}.`);
    }
  }
}
