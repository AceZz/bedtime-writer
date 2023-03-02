import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

/// GPT-3 API Call
/// Call example: callOpenAiTextGeneration('Generate a story with a dragon')
Future<String> callOpenAiTextGeneration({required String prompt}) async {
  // Parameters for API call
  final apiKey = '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';
  final promptJson = jsonEncode({
    'messages': [
      {
        'role': 'system',
        'content': 'Act as a professional storyteller for children.'
      },
      {'role': 'user', 'content': '$prompt'},
    ],
    'model': 'gpt-3.5-turbo',
    'max_tokens': 3900,
    'temperature': 1.0,
    'presence_penalty': 0.7,
    'frequency_penalty': 0.3,
  });

  // POST the API call
  try {
    final response = await http.post(
      Uri.parse('https://api.openai.com/v1/chat/completions'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: promptJson,
    );

    // Decode API response with Utf-8
    if (response.statusCode == 200) {
      final responseJson =
          jsonDecode(Utf8Decoder().convert(response.bodyBytes));
      return responseJson['choices'][0]['message']['content'];
    } else {
      throw Exception('Failed to generate text');
    }
  } on SocketException catch (_) {
    rethrow;
  }
}

/// DALL-E API Call
/// Call example: callOpenAiImageGeneration(characterType: 'dragon', location: 'in the mountains')
Future<String> callOpenAiImageGeneration({required String prompt}) async {
  // Parameters for API call
  final apiKey = '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';
  final promptJson = jsonEncode({
    'prompt': prompt,
    'n': 1,
    'size': '512x512',
  });

  // POST the API call
  try {
    final response = await http.post(
      Uri.parse('https://api.openai.com/v1/images/generations'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: promptJson,
    );

    // Decode API response
    if (response.statusCode == 200) {
      final responseJson = jsonDecode(response.body);
      return responseJson['data'][0]['url'];
    } else {
      throw Exception('Failed to generate image');
    }
  } on SocketException catch (_) {
    rethrow;
  }
}
