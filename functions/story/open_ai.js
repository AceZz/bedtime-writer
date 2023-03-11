import { Configuration, OpenAIApi } from "openai";

import {
  getStoryTitle,
  getPromptForImagePrompt,
  getPrompt,
} from "./story_params.js";

import process from "node:process";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function callOpenAi(storyParams) {
  var data = {
    title: getStoryTitle(storyParams),
    prompt: getPrompt(storyParams),
    promptForImagePrompt: getPromptForImagePrompt(storyParams),
  };

  if (process.env.DEBUG === "true") {
    return {
      ...data,
      story: "test",
      imageUrl: "https://avatars.githubusercontent.com/u/11032610?v=4",
    };
  }

  // Call callOpenAiCompletions first, and then callOpenAiImagesGeneration with the result as an argument
  // Story call
  const startStory = performance.now();
  const story = await callOpenAiCompletions(data.prompt);
  const endStory = performance.now();
  console.log(`Story: ${endStory - startStory} milliseconds.`);

  // ImagePrompt call
  const startImagePrompt = performance.now();
  const imagePrompt = await callOpenAiCompletionsForImagePrompt(
    data.prompt,
    story,
    data.promptForImagePrompt
  );
  const endImagePrompt = performance.now();
  console.log(
    `Image prompt: ${endImagePrompt - startImagePrompt} milliseconds.`
  );

  // Image generation call
  const startImageGeneration = performance.now();
  const imageUrl = await callOpenAiImagesGeneration(imagePrompt, 512);
  const endImageGeneration = performance.now();
  console.log(
    `Image generation: ${
      endImageGeneration - startImageGeneration
    } milliseconds.`
  );

  return {
    ...data,
    story: story,
    imagePrompt: imagePrompt,
    imageUrl: imageUrl,
  };
}

function callOpenAiStream(prompt) {
  const sseclient = require("sseclient");
  const fetch = require("node-fetch");

  const messages = [
    { role: "system", content: "Act as a professional writer for children." },
    { role: "user", content: `${prompt}` },
  ];

  let story = "";

  openai
    .createChatCompletion({
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
    })
    .then((response) => response.data.choices[0].message.content);
  
  const reqUrl = "https://api.openai.com/v1/chat/completions";
  const reqHeaders = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
    Authorization: "Bearer " + API_KEY,
  };
  const reqBody = {
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 1500,
    temperature: 1.0,
    presence_penalty: 0.7,
    frequency_penalty: 0.2,
    stream: true,
  };
  fetch(reqUrl, {
    method: "POST",
    headers: reqHeaders,
    body: JSON.stringify(reqBody),
  })
    .then((res) => {
      const client = new sseclient(res.body);
      let token_counter = 0;
      client.on("data", (event) => {
        if (event !== "[DONE]") {
          const data = JSON.parse(event);
          if ("content" in data["choices"][0]["delta"].keys()) {
            // Update the story
            story += data["choices"][0]["delta"]["content"];
            token_counter += 1;

            // Launch prompt generation after 100 tokens
            if (token_counter === 100) {
              console.log("\n Started prompt generation\n");
              generate_dalle_prompt(story, prompt);
            }
          }
        }
      });
    })
    .catch((err) => console.error(err));

  // A dummy function to represent generate_dalle_prompt
  function generate_dalle_prompt(story, prompt) {
    console.log(`Generating prompt with story: ${story} and prompt: ${prompt}`);
  }

  // Wait for the thread to complete
  // There's no equivalent to threading in JavaScript, so we don't need to do anything here
  console.log(story);
}

function callOpenAiCompletions(prompt) {
  return openai
    .createChatCompletion({
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
    })
    .then((response) => response.data.choices[0].message.content);
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
    .then((response) => response.data.choices[0].message.content);
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
