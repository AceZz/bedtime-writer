import { FakeImageApi, FakeTextApi } from "../../../src/fake";

// Fake APIs, configured to be as fast as possible.
export const FAKE_TEXT_API = new FakeTextApi(3, 100, 0, 0);
export const FAKE_IMAGE_API = new FakeImageApi();
