import express, { json } from "express";

import {
  FirestoreContext,
  FirebaseStoryReader,
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
} from "../../firebase";

initEnv();
initFirebase();

const app = express();
app.use(json());

app.set("view engine", "pug");
app.set("views", "./src/admin/interface/views");
const port = 3000;

const firestore = new FirestoreContext();

app.get("/", async (req, res) => {
  const firestore = new FirestoreContext();
  const storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);

  const formIds = await storyReader.getFormIds();
  res.render("index", { formIds });
});

app.get("/form", async (req, res) => {
  // Get form from request
  const selectedFormId = req.query.formId as string;

  if (!selectedFormId) {
    res.redirect("/");
    return;
  }
  const storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);

  const imageMap = await storyReader.readFormStoryImagesAsMap(selectedFormId);
  const imageIds = Array.from(imageMap.keys());
  const numStories = (await storyReader.getFormStoryIds(selectedFormId)).length;

  // Get current imageId from request
  if (req.query.imageId === undefined || req.query.imageId === null) {
    req.query.imageId = imageMap.keys().next().value;
  }
  const currentImageId = req.query.imageId as string;

  const currentImage = imageMap.get(currentImageId);
  const currentIndex = imageIds.indexOf(currentImageId);
  const nextIndex = (currentIndex + 1) % imageIds.length;
  const nextImageId = imageIds[nextIndex];

  const currentUiIndex = currentIndex + 1;
  const maxUiIndex = imageIds.length;
  res.render("form", {
    currentImageId,
    currentImage,
    currentUiIndex,
    maxUiIndex,
    nextImageId,
    selectedFormId,
    numStories,
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

app.listen(port, () => {
  console.log(`Admin panel: http://localhost:${port}`);
});
