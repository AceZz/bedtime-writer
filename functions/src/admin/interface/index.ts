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
  res.render("index", { formIds }); // Use the existing Pug file
});

app.get("/form", async (req, res) => {
  const selectedFormId = req.query.formId as string;
  if (!selectedFormId) {
    // Handle missing formId, maybe redirect to index
    res.redirect("/");
    return;
  }

  const firestore = new FirestoreContext();
  const storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);

  const storyIds = await storyReader.getFormStoryIds(selectedFormId);
  const numberOfStories = storyIds.length; // Get the count of stories

  const allImages: { [key: string]: { id: string; data: string }[] } = {};

  for (const storyId of storyIds) {
    const imageIds = await storyReader.getImageIds(storyId);
    const images = await Promise.all(
      imageIds.map(async (id) => {
        const data = await storyReader.getImage(storyId, id);
        return { id, data: data.toString("base64") };
      })
    );
    allImages[storyId] = images;
  }

  res.render("form", {
    title: `Images from Form ID: ${selectedFormId}`,
    allImages,
    numberOfStories, // Include this in rendering
  });
});

app.listen(port, () => {
  console.log(`Admin panel: http://localhost:${port}`);
});
