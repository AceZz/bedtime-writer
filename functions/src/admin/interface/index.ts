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
  const selectedFormId = req.query.formId as string;
  if (!selectedFormId) {
    // Handle missing formId, redirect to index
    res.redirect("/");
    return;
  }

  const firestore = new FirestoreContext();
  const storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);

  const storyIds = await storyReader.getFormStoryIds(selectedFormId);
  const numStories = storyIds.length; // Get the count of stories

  const allImages: {
    [key: string]: { id: string; data: string; status: string | undefined }[];
  } = {};

  for (const storyId of storyIds) {
    const imageIds = await storyReader.getImageIds(storyId);
    const images = await Promise.all(
      imageIds.map(async (imageId) => {
        const data = await storyReader.getImage(storyId, imageId);
        const status = await storyReader.getImageStatus(storyId, imageId);
        return { id: imageId, data: data.toString("base64"), status: status };
      })
    );
    allImages[storyId] = images;
  }

  res.render("form", {
    title: `Images from Form ID: ${selectedFormId}`,
    allImages,
    numStories: numStories,
  });
});

app.listen(port, () => {
  console.log(`Admin panel: http://localhost:${port}`);
});
