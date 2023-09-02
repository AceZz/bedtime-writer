import express from "express";
import {
  FirebaseStoryQuestionReader,
  FirestoreContext,
  initEnv,
  initFirebase,
} from "../../firebase";

const app = express();
app.set("view engine", "pug");
app.set("views", "./src/admin/interface/views");
const port = 3000;

initEnv();
initFirebase();

app.get("/", async (req, res) => {
  const firestore = new FirestoreContext();

  const questionsReader = new FirebaseStoryQuestionReader(
    firestore.storyQuestions
  );
  const questions = await questionsReader.readAll();

  res.render("index", {
    title: "Questions",
    questions: questions.map((question) => question.text),
  });
});

app.listen(port, () => {
  console.log(`Admin panel: http://localhost:${port}`);
});
