import { CreateImageRequest, OpenAIApi } from "openai";
import { ImageApi, ImageApiConfig } from "./image_api";
import { compressToPng } from "../../../utils";

// These parameters were found with a benchmark on OpenAI data.
const IMAGE_COMPRESSION_PARAMETERS = {
  effort: 3,
  compressionLevel: 6,
};

/**
 * Implementation of the `ImageApi` for OpenAI models.
 */
export class OpenAiImageApi implements ImageApi {
  private api: OpenAIApi;

  constructor(api: OpenAIApi) {
    this.api = api;
  }

  async getImage(prompt: string, config: ImageApiConfig): Promise<Buffer> {
    const params = this.getModelParameters(prompt, config);
    const response = await this.api.createImage(params);

    const data = response.data.data[0].b64_json;
    if (data === undefined) {
      throw Error("OpenAiImageApi.getImage() failed");
    }
    return this.compressImage(Buffer.from(data, "base64"));
  }

  private getModelParameters(
    prompt: string,
    config: ImageApiConfig
  ): CreateImageRequest {
    return {
      prompt: prompt,
      size: "512x512",
      ...config,
      response_format: "b64_json",
    };
  }

  private compressImage(image: Buffer): Promise<Buffer> {
    return compressToPng(image, IMAGE_COMPRESSION_PARAMETERS);
  }
}
