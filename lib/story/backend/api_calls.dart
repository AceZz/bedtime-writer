import 'dart:convert';
import 'package:http/http.dart' as http;

/// MADE BY TRISTAN
/// For later: handle cases when API calls fail

/// GPT-3 API Call
class OpenAiTextGenerationCall {

  static Future<String> getText({
    String prompt='Just say \"Error: no prompt provided\"'
  }) async {

    /// Parameters for API call
    final apiKey = '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';
    final promptJson = jsonEncode({
      "prompt": prompt,
      "model": "text-davinci-003",
      "max_tokens": 3900,
      "temperature": 0.9,
      "frequency_penalty": 0,
      "presence_penalty": 0,
    });

    /// POST the API call
    final response = await http.post(
      Uri.parse('https://api.openai.com/v1/completions'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: promptJson,
    );

    /// Decode API response
    /// possibly add this for decoding: Utf8Decoder().convert(response.bodyBytes)
    if (response.statusCode == 200) {
      final responseJson = jsonDecode(response.body);
      return responseJson["choices"][0]["text"];
    } else {
      throw Exception('Failed to generate text');
    }
  }
}

/// DALL-E API Call
class OpenAiImageGenerationCall {

  static Future<String> getUrl({
    String characterType = '',
    String location = '',
  }) async {

    /// Parameters for API call
    final apiKey = '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';
    final promptJson = jsonEncode({
      "prompt": "A beautiful professional children illustration of a $characterType. It takes place $location.",
      "n": 1,
      "size": "512x512",
    });

    /// POST the API call
    final response = await http.post(
      Uri.parse('https://api.openai.com/v1/images/generations'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: promptJson,
    );

    /// Decode API response
    /// possibly add this for decoding: Utf8Decoder().convert(response.bodyBytes)
    if (response.statusCode == 200) {
      final responseJson = jsonDecode(response.body);
      return responseJson["data"][0]["url"];
    } else {
      throw Exception('Failed to generate image');
    }
  }
}

