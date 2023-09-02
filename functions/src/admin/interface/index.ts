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
  const firstFormId = formIds[0]; // Assume at least one exists

  const storyIds = await storyReader.getFormStoryIds(firstFormId);

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

  res.render("index", {
    title: `Images from Form ID: ${firstFormId}`,
    allImages,
  });
});

app.listen(port, () => {
  console.log(`Admin panel: http://localhost:${port}`);
});
