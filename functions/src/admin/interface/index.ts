import express, { json } from "express";
import { getImageApi } from "../../api";

import {
  FirestoreContext,
  FirebaseStoryReader,
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
  FirebaseStoryFormWriter,
  FirebaseStoryFormReader,
} from "../../firebase";
import { initLocalSecrets } from "../../firebase/utils";

initEnv();
initLocalSecrets();
initFirebase();

const app = express();
app.use(json());

app.set("view engine", "pug");
app.set("views", "./src/admin/interface/views");
const port = 3000;

const firestore = new FirestoreContext();
const storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);
const formReader = new FirebaseStoryFormReader(firestore.storyFormsLanding);
const formWriter = new FirebaseStoryFormWriter(
  firestore.storyFormsLanding,
  undefined,
  storyReader
);

app.get("/", async (req, res) => {
  const formIds = await formReader.readCachedNotApprovedIds();
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

  const logic = (await storyReader.getClassicStoryLogic(storyId)).toString();

  const isFormApprovable = await storyReader.checkAllFormImagesApproved(formId);

  res.render("form", {
    formId,
    storyId,
    imageId,
    logic,
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
    await storyWriter.regenImage(storyId, imageId, imageApi);
    res.json({ status: "success", message: "Image approved" });
  } catch (err) {
    res.json({ status: "error", message: `${err}` });
  }
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
