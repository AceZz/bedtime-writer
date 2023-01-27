import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'lat_lng.dart';
import 'place.dart';

String storyGetPrompt(List<dynamic> questions) {
  var prompt =
      'Act as a storytelling professional. You will create a bedtime story appropriate for children of 5, '
      'which should last about <duration> minutes to read. You will base the story on all the following elements. '
      'The main character of the story is <character>. The story happens <location>. The main character is <power>. '
      'The main character has to face a struggle of your choice. <object> is important in the story.';

  for (var question in questions) {
    var key = question['key'];
    var answer = question['answer'];
    prompt = prompt.replaceFirst('<$key>', answer);
  }

  return prompt;
}

String utilsTestPrompt() {
  return '''Once upon a time, there lived a very smart fish named Fifi. She lived deep in the ocean, surrounded by her sea friends.\n\n'''
      '''One day, Fifi noticed a strange hat floating around in the water. She was curious and wanted to find out what it was. '''
      '''She swam closer and suddenly the hat started to glow!\n\n'''
      '''Fifi was amazed and decided to pick it up. When she did, a voice came from the hat. It said “hello, I am a magical hat. '''
      '''I can make your wildest dreams come true. All you have to do is put me on your head and make a wish”.\n\n'''
      '''Fifi was so excited and quickly put on the hat. But then she realized that with great power comes great responsibility. '''
      '''She had to use the magic wisely, for the good of all the sea creatures.\n\n'''
      '''But the problem was, Fifi didn\'t know how to use her new-found power correctly. She was suddenly faced with a huge struggle.\n\n'''
      '''Fifi swam around, trying to think of a way to use the hat\'s magic. Suddenly, she had an idea!\n\n'''
      '''She used the hat\'s magic to turn the ocean into a safe place for all the sea creatures''';
}

List<dynamic> characterInitQuestions(
  String character,
  String characterType,
) {
  return [
    {
      'key': 'character',
      'answer': character,
    },
    {
      'key': 'characterType',
      'answer': characterType,
    },
    {
      'key': 'power',
      'text': 'The main character is...',
      'choices': [
        {
          'text': 'Very strong',
          'icon': 'power_strength',
          'value': 'very strong'
        },
        {'text': 'Able to fly', 'icon': 'power_fly', 'value': 'able to fly'},
        {'text': 'Very smart', 'icon': 'power_smart', 'value': 'very smart'},
      ]
    },
    {
      'key': 'location',
      'text': 'The story takes place...',
      'choices': [
        {
          'text': 'Deep in the ocean',
          'icon': 'place_ocean',
          'value': 'deep in the ocean'
        },
        {'text': 'In the woods', 'icon': 'place_tree', 'value': 'in the woods'},
        {
          'text': 'In a magical kingdom',
          'icon': 'place_magic',
          'value': 'in a magical kingdom'
        },
      ]
    },
    {
      'key': 'object',
      'text': 'The main character has...',
      'choices': [
        {'text': 'A guitar', 'icon': 'object_guitar', 'value': 'a guitar'},
        {'text': 'A hat', 'icon': 'object_hat', 'value': 'a hat'},
        {'text': 'A rocket', 'icon': 'object_rocket', 'value': 'a rocket'},
      ]
    },
    {
      'key': 'duration',
      'text': 'How long is the story?',
      'choices': [
        {'text': 'Short (2 min)', 'icon': 'duration_short', 'value': '2'},
        {'text': 'Long (5 min)', 'icon': 'duration_long', 'value': '5'},
      ]
    },
  ];
}

String questionGetChoiceText(
  int questionIndex,
  int choiceIndex,
  List<dynamic> questions,
) {
  if (questions.length > questionIndex &&
      questions[questionIndex].containsKey('choices') &&
      questions[questionIndex]['choices'].length > choiceIndex &&
      questions[questionIndex]['choices'][choiceIndex].containsKey('text')) {
    return questions[questionIndex]['choices'][choiceIndex]['text'];
  }

  return '';
}

List<dynamic> questionSetAnswer(
  int questionIndex,
  int choiceIndex,
  List<dynamic> questions,
) {
  if (questions.length > questionIndex &&
      questions[questionIndex].containsKey('choices') &&
      questions[questionIndex]['choices'].length > choiceIndex &&
      questions[questionIndex]['choices'][choiceIndex].containsKey('value')) {
    questions[questionIndex]['answer'] =
        questions[questionIndex]['choices'][choiceIndex]['value'];
  }

  return questions;
}

bool questionIsChoiceAvailable(
  int questionIndex,
  int choiceIndex,
  List<dynamic> questions,
) {
  if (questions.length > questionIndex &&
      questions[questionIndex].containsKey('choices')) {
    return questions[questionIndex]['choices'].length > choiceIndex;
  }

  return false;
}

String utilsJsonListToString(List<dynamic> data) {
  return data.toString();
}

String utilsGetAnswer(
  String key,
  List<dynamic> questions,
) {
  for (var question in questions) {
    if (question['key'] == key) {
      return question['answer'];
    }
  }

  return '';
}

int characterGetFirstQuestionIndex(List<dynamic> questions) {
  var i = 0;
  for (var question in questions) {
    if (!question.containsKey('answer')) {
      return i;
    }
    i++;
  }
  return i;
}

String questionGetChoiceIcon(
  int questionIndex,
  int choiceIndex,
  List<dynamic> questions,
) {
  if (questions.length > questionIndex &&
      questions[questionIndex].containsKey('choices') &&
      questions[questionIndex]['choices'].length > choiceIndex &&
      questions[questionIndex]['choices'][choiceIndex].containsKey('icon')) {
    return questions[questionIndex]['choices'][choiceIndex]['icon'];
  }

  return '';
}
