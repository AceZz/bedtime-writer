import * as dotenv from "dotenv";
dotenv.config();

import { Configuration, OpenAIApi } from "openai";

import { getPromptForImagePrompt } from "./story/story_params.js";

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Parameters
const numTokenStartImagePrompt = 100;

// Main body
const prompt = "Write a small fairytale about a dragon in a about 100 words.";
const result = await callOpenAiCompletions(prompt);
console.log(result);

async function callOpenAiCompletions(prompt) {
  // Initialize stream
  const completion = await openai.createChatCompletion(
    {
      messages: [
        {
          role: "system",
          content: "Act as a professional writer for children.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 1200,
      temperature: 1.0,
      frequency_penalty: 0.7,
      presence_penalty: 0.2,
      stream: true,
    },
    { responseType: "stream" }
  );

  return new Promise(async (resolve) => {
    let story = "";
    // Initialize story
    let promptForImagePrompt =
      "Write a short prompt for dalle to illustrate the story.";
    let imagePrompt;
    let imageUrl;
    let tokenCounter = 0;
    completion.data.on("data", (data) => {
      const lines = data
        ?.toString()
        ?.split("\n")
        .filter((line) => line.trim() !== "");
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        if (message == "[DONE]") {
          console.log("Message done received");
        } else {
          let token;
          try {
            token = JSON.parse(message)?.choices?.[0]?.delta?.content;
            // Test if token had a value for content field, ie is a piece of the story
            if (token != null) {
              story += token;
            }
            tokenCounter++;
          } catch {
            console.log("ERROR", json);
          }
          if (tokenCounter == numTokenStartImagePrompt) {
            // TODO: make sure function waits for result here to complete
            imageUrl = startThread(prompt, story, promptForImagePrompt);
          }
        }
      }
    });
    const result = {
      story: story,
      imagePrompt: imagePrompt,
      imageUrl: imageUrl,
    };
    resolve(result);
  });
}

function startThread(prompt, story, promptForImagePrompt) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('worker.js');
    // Send any necessary data to the worker using worker.postMessage()
    worker.postMessage({
      prompt: prompt,
      story: story,
      promptForImagePrompt: promptForImagePrompt
    });
    // Listen for messages from the worker using worker.onmessage()
    worker.onmessage = (event) => {
      const imageUrl = event.data;
      resolve(imageUrl);
    };
  });
}
