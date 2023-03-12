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
  
  self.onmessage = async (event) => {
    const data = event.data;
    const imagePrompt = await callOpenAiCompletionsForImagePrompt(
      data.prompt,
      data.story,
      data.promptForImagePrompt
    );
    const imageUrl = await callOpenAiImagesGeneration(imagePrompt, 512);
    self.postMessage(imageUrl);
  };
  