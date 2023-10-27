import express, { json } from "express";
import multer from "multer";
import { getImageApi, getTextApi } from "../../api";

import {
  FirestoreContext,
  FirebaseStoryReader,
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
  FirebaseStoryFormWriter,
} from "../../firebase";
import { initLocalSecrets } from "../../firebase/utils";
import _ from "lodash";
import { compressToPng } from "../../utils";
import sharp from "sharp";

initEnv();
initLocalSecrets();
initFirebase();

const app = express();
app.use(json());

app.set("view engine", "pug");
app.set("views", "./src/admin/interface/views");
const port = 3000;
const upload = multer();

const firestore = new FirestoreContext();
const storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);
const formWriter = new FirebaseStoryFormWriter(
  firestore.storyFormsLanding,
  storyReader
);

app.get("/", async (req, res) => {
  const formIds = await firestore.storyFormsLanding.getIds({
    isCached: true,
    isApproved: false,
  });
  res.render("index", { formIds });
});

app.get("/form", async (req, res) => {
  // Get form from request
  const formId = req.query.formId as string;

  if (!formId) {
    res.redirect("/");
    return;
  }
  const storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);
  const storyImageIds = await storyReader.getFormStoryImageIds(formId);
  const numStories = (await storyReader.readFormStories(formId)).length;

  // Get current imageId from request
  if (req.query.imageId === undefined || req.query.imageId === null) {
    req.query.storyId = storyImageIds[0].storyId;
    req.query.imageId = storyImageIds[0].imageId;
  }

  const storyId = req.query.storyId as string;
  const imageId = req.query.imageId as string;

  const image = await storyReader.getImage(storyId, imageId);
  const index = storyImageIds.findIndex((im) => im.imageId == imageId);
  const previousIndex =
    (index - 1 + storyImageIds.length) % storyImageIds.length;
  const previousStoryId = storyImageIds[previousIndex].storyId;
  const previousImageId = storyImageIds[previousIndex].imageId;
  const nextIndex = (index + 1) % storyImageIds.length;
  const nextStoryId = storyImageIds[nextIndex].storyId;
  const nextImageId = storyImageIds[nextIndex].imageId;

  const uiIndex = index + 1;
  const maxUiIndex = storyImageIds.length;

  // Remove the "null" from the story logic and stringify it.
  const fullLogic = await storyReader.getClassicStoryLogic(storyId);
  const filteredLogic = _.omitBy(fullLogic, _.isNull);
  const logic = JSON.stringify(filteredLogic, null, 2);

  const { imagePromptPrompt, imagePrompt } = await storyReader.getImagePrompts(
    storyId,
    imageId
  );

  const imagePromptD3 = getImagePromptD3(imagePrompt);

  const isFormApprovable = await storyReader.checkAllFormImagesApproved(formId);

  res.render("form", {
    formId,
    storyId,
    imageId,
    logic,
    imagePromptPrompt,
    imagePrompt,
    imagePromptD3,
    image,
    uiIndex,
    maxUiIndex,
    previousStoryId,
    previousImageId,
    nextStoryId,
    nextImageId,
    numStories,
    isFormApprovable,
  });
});

function getImagePromptD3(imagePrompt: string): string {
  // Ensure the prompt is complete.
  const indexOfLastDot = imagePrompt.lastIndexOf(".");
  return `Square image. ${imagePrompt.substring(0, indexOfLastDot + 1)}`;
}

app.post("/approve-image", async (req, res) => {
  const { storyId, imageId } = req.body;
  const storyWriter = new FirebaseStoryWriter(firestore.storyCacheLanding);
  try {
    await storyWriter.approveImage(storyId, imageId);
    res.json({ status: "success", message: "Image approved" });
  } catch (err) {
    res.json({ status: "error", message: `${err}` });
  }
});

app.post("/regen-image", async (req, res) => {
  const { storyId, imageId } = req.body;
  const storyWriter = new FirebaseStoryWriter(firestore.storyCacheLanding);
  try {
    const imageApi = getImageApi();
    const textApi = getTextApi("gpt-3.5-turbo");
    await storyWriter.regenImage(storyId, imageId, textApi, imageApi);
    res.json({ status: "success", message: "Image approved" });
  } catch (err) {
    res.json({ status: "error", message: `${err}` });
  }
});

app.post("/upload-image", upload.single("image"), async (req, res) => {
  const { formId, storyId, imageId } = req.body;
  let buffer = req.file?.buffer;

  // Compress and resize the image to 512 x 512 (the image is cropped if the
  // ratio is not 1:1).
  if (buffer === undefined) {
    res.json({ status: "error", message: "buffer is undefined" });
    return;
  }
  buffer = await sharp(buffer).resize(512, 512, { fit: "cover" }).toBuffer();
  buffer = await compressToPng(buffer, {
    effort: 3,
    compressionLevel: 9,
  });

  // Replace the image.
  const storyWriter = new FirebaseStoryWriter(firestore.storyCacheLanding);

  try {
    await storyWriter.replaceImage(storyId, imageId, buffer);
  } catch (err) {
    res.json({ status: "error", message: `${err}` });
  }

  // Approve it by default.
  await storyWriter.approveImage(storyId, imageId);

  res.redirect(`/form?formId=${formId}&storyId=${storyId}&imageId=${imageId}`);
});

app.post("/approve-form", async (req, res) => {
  const { formId } = req.body;

  try {
    await formWriter.approveForm(formId);
    res.json({ status: "success", message: "Form approved" });
  } catch (err) {
    res.json({ status: "error", message: `${err}` });
  }
});

app.listen(port, () => {
  console.log(`Admin panel: http://localhost:${port}`);
});
