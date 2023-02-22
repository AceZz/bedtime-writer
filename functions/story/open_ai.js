import { Configuration, OpenAIApi } from "openai";

import process from "node:process";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export function callOpenAiCompletions(prompt) {
  return openai
    .createChatCompletion({
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 3900,
      temperature: 1.0,
      frequency_penalty: 0.7,
      presence_penalty: 0.3,
    })
    .then((response) => response.data.choices[0].message.content);
}

export function callOpenAiImagesGeneration(imagePrompt, size = 512) {
  return openai
    .createImage({
      prompt: imagePrompt,
      n: 1,
      size: `${size}x${size}`,
    })
    .then((response) => response.data.data[0].url);
}
