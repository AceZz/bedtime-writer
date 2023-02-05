import '../../flutter_flow/flutter_flow_util.dart';
import 'api_manager.dart';

export 'api_manager.dart' show ApiCallResponse;

import 'dart:convert';
import 'package:http/http.dart' as http;

class OpenAiBedtimeStoryCall {
  static Future<ApiCallResponse> call({
    String? prompt = 'Just say \"Error: no prompt provided\"',
  }) {
    final body = '''
{
  "model": "text-davinci-003",
  "prompt": "$prompt",
  "temperature": 0.9,
  "max_tokens": 3900,
  "frequency_penalty": 0,
  "presence_penalty": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'open ai bedtime story',
      apiUrl: 'https://api.openai.com/v1/completions',
      callType: ApiCallType.POST,
      headers: {
        'Content-Type': 'application/json',
        'Authorization':
            'Bearer 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',
      },
      params: {},
      body: body,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: true,
      cache: false,
    );
  }

  static dynamic text(dynamic response) => getJsonField(
        response,
        r'''$.choices[:].text''',
      );
}

class OpenAiDalleCall {
  static Future<ApiCallResponse> call({
    String? characterType = '',
    String? location = '',
  }) {
    final body = '''
{
  "prompt": "A beautiful professional children illustration of a $characterType. It takes place $location.",
  "n": 1,
  "size": "512x512"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'open ai dalle',
      apiUrl: 'https://api.openai.com/v1/images/generations',
      callType: ApiCallType.POST,
      headers: {
        'Content-Type': 'application/json',
        'Authorization':
            'Bearer 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',
      },
      params: {},
      body: body,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
    );
  }

  static dynamic url(dynamic response) => getJsonField(
        response,
        r'''$.data[:].url''',
      );
}

class ApiPagingParams {
  int nextPageNumber = 0;
  int numItems = 0;
  dynamic lastResponse;

  ApiPagingParams({
    required this.nextPageNumber,
    required this.numItems,
    required this.lastResponse,
  });

  @override
  String toString() =>
      'PagingParams(nextPageNumber: $nextPageNumber, numItems: $numItems, lastResponse: $lastResponse,)';
}

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

