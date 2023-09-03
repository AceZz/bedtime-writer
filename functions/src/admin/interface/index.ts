import express from "express";
import {
  FirestoreContext,
  FirebaseStoryReader,
  initEnv,
  initFirebase,
} from "../../firebase";

initEnv();
initFirebase();

const app = express();
app.set("view engine", "pug");
app.set("views", "./src/admin/interface/views");
const port = 3000;

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

  const firestore = new FirestoreContext();
  const storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);

  const storyIds = (await storyReader.getFormStoryIds(selectedFormId)).sort();
  const numStories = storyIds.length;

  const allImages: {
    [imageId: string]: {
      storyId: string;
      data: string;
      status: string | undefined;
    };
  } = {};

  let allImageIds: string[] = [];

  for (const storyId of storyIds) {
    const imageIds = await storyReader.getImageIds(storyId);
    allImageIds = allImageIds.concat(imageIds);
    await Promise.all(
      imageIds.map(async (imageId) => {
        const data = await storyReader.getImage(storyId, imageId);
        const status = await storyReader.getImageStatus(storyId, imageId);
        allImages[imageId] = {
          storyId: storyId,
          data: data.toString("base64"),
          status: status,
        };
      })
    );
  }
  allImageIds.sort();

  // Get current imageId from request
  if (req.query.imageId === undefined || req.query.imageId === null) {
    req.query.imageId = allImageIds[0];
  }
  const currentImageId = req.query.imageId as string;

  const currentImage = allImages[currentImageId];
  const currentIndex = allImageIds.indexOf(currentImageId);
  const nextIndex = (currentIndex + 1) % allImageIds.length;
  const nextImageId = allImageIds[nextIndex];

  const currentUiIndex = currentIndex + 1;
  const maxUiIndex = allImageIds.length;
  res.render("form", {
    title: `Images from Form ID: ${selectedFormId}`,
    currentImageId,
    currentImage,
    currentUiIndex,
    maxUiIndex,
    nextImageId,
    selectedFormId,
    numStories,
  });
});

app.listen(port, () => {
  console.log(`Admin panel: http://localhost:${port}`);
});
