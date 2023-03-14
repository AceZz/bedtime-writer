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
const promptForImagePrompt = "Write a short prompt for dalle to illustrate the story.";
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
    let imageData;
    let tokenCounter = 0;
    completion.data.on("data", async (data) => {
      const lines = extractLines(data);
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        // End the stream if message "[DONE]" is received
        if (message == "[DONE]") {
          console.log("Message done received");
          imageData = await imageData;
          let result = {
            story: story,
            imagePrompt: imageData.imagePrompt,
            imageUrl: imageData.imageUrl,
          };
          resolve(result);
          // Else continue listening to the stream
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
            imageData = callOpenAiPromptAndImage(
              prompt,
              story,
              promptForImagePrompt
            );
          }
        }
      }
    });
  });
}

function extractLines(data) {
  return data
  ?.toString()
  ?.split("\n")
  .filter((line) => line.trim() !== "");
}

async function callOpenAiPromptAndImage(prompt, story, promptForImagePrompt) {
  const imagePrompt = await callOpenAiCompletionsForImagePrompt(
    prompt,
    story,
    promptForImagePrompt
  );
  const imageUrl = await callOpenAiImagesGeneration(imagePrompt, 512);
  return { imagePrompt: imagePrompt, imageUrl: imageUrl };
}

function callOpenAiCompletionsForImagePrompt(
  prompt,
  story,
  promptForImagePrompt
) {
  return openai
    .createChatCompletion({
      messages: [
        {
          role: "system",
          content: "Act as a professional illustrator for children.",
        },
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: story,
        },
        {
          role: "user",
          content: promptForImagePrompt,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      temperature: 0.4,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    .then((response) => {
      // TODO: understand why this returns undefined
      return response.data.choices[0].message.content;
    });
}

function callOpenAiImagesGeneration(imagePrompt, size = 512) {
  return openai
    .createImage({
      prompt: imagePrompt,
      n: 1,
      size: `${size}x${size}`,
    })
    .then((response) => response.data.data[0].url);
}
