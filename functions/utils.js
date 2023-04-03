import sharp from "sharp";

/**
 * Compress an image to a PNG, following the provided parameters (which are passed to sharp.png).
 * @returns a Buffer.
 */
export async function compressPNG(input, parameters) {
  return await sharp(input).png(parameters).toBuffer();
}
