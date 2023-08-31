// This default image size ensures consistency accross the back-end.
export const IMAGE_SIZE_DEFAULT = "512x512";

/**
 * Generic interface to generate an image.
 */
export interface ImageApi {
  /**
   * Generate an image.
   *
   * @param prompt The prompt of the image generation.
   * @param config Specific configuration for the image generation.
   */
  getImage(prompt: string, config: ImageApiConfig): Promise<Buffer>;
}

export interface ImageApiConfig {
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024";
}
