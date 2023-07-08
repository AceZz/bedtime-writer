import { CLASSIC_LOGIC } from "../../logic";
import { StoryRequestManager } from "../story_request_manager";
import { StoryPath, StoryRequestV1 } from "./story_request_v1";
import { StoryRequestV1FirestoreConverter } from "./story_request_v1_firestore_converter";
import { StoryRequestV1JsonConverter } from "./story_request_v1_json_converter";
  
export class StoryRequestV1Manager
  implements StoryRequestManager<StoryRequestV1>
{
  readonly storyPath: StoryPath;
  private firestoreConverter: StoryRequestV1FirestoreConverter;
  private jsonConverter: StoryRequestV1JsonConverter;

  constructor(storyPath: StoryPath) {
    this.storyPath = storyPath;
    this.firestoreConverter = new StoryRequestV1FirestoreConverter(this.storyPath);
    this.jsonConverter = new StoryRequestV1JsonConverter();
  }

  async get(id: string): Promise<StoryRequestV1> {
    return this.firestoreConverter.get(id);
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
