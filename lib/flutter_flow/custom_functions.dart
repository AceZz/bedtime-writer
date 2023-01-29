import 'dart:math' as math;

String storyGetPrompt(List<dynamic> questions) {
  var prompt =
      'Act as a storyteller. Tell a bedtime story, with details, for a 5-year old, which should last about <duration> minutes. '
      'The main character of the story is <characterName>, a <characterType>. It has a flaw: <flaw>. It has a power: <power>. '
      'It will be challenged with <challenge>. '
      'The story happens <place>. This object shall be important: <object>. '
      'The story shall end well and with this moral: <moral>';

  for (var question in questions) {
    var key = question['key'];
    var answer = question['answer'];
    prompt = prompt.replaceFirst('<$key>', answer);
  }

  return prompt;
}

List<dynamic> characterInitQuestions(
  String characterName,
  String characterType,
) {
  const numRequiredQuestions = 2;

  const templates = [
    /** FLAW */
    {
      'key': 'flaw',
      'text': 'What flaw does the main character have?',
      'choices': [
        {
          'text': 'Being afraid of failure',
          'icon': 'flaw_afraid_failure',
          'value': 'being afraid of failure',
          'exclude': [],
        },
        {
          'text': 'Lacking self-confidence',
          'icon': 'flaw_not_confident',
          'value': 'lacking self-confidence',
          'exclude': [],
        },
        {
          'text': 'Being a bit lazy',
          'icon': 'flaw_lazy',
          'value': 'being a bit lazy',
          'exclude': [],
        },
        {
          'text': 'Giving up easily',
          'icon': 'flaw_give_up',
          'value': 'being a bit lazy',
          'exclude': [],
        },
        {
          'text': 'Thinking they are ugly',
          'icon': 'flaw_ugly',
          'value': 'being a bit lazy',
          'exclude': [],
        },
        {
          'text': 'Not listening to advice',
          'icon': 'flaw_no_advice',
          'value': 'not listening to advice',
          'exclude': [],
        },
      ],
    },
    /** PLACE */
    {
      'key': 'place',
      'text': 'The story takes place...',
      'choices': [
        {
          'text': 'In a magical forest',
          'icon': 'place_magic',
          'value': 'in a magical forest',
          'exclude': [],
        },
        {
          'text': 'In a quiet village',
          'icon': 'place_village',
          'value': 'in a quiet village',
          'exclude': [],
        },
        {
          'text': 'In an underwater kingdom',
          'icon': 'place_underwater',
          'value': 'in an underwater kingdom',
          'exclude': ['horse'],
        },
        {
          'text': 'In a space station',
          'icon': 'place_space',
          'value': 'in a space station',
          'exclude': [],
        },
        {
          'text': 'In a dry desert',
          'icon': 'place_desert',
          'value': 'in a dry desert',
          'exclude': [],
        },
        {
          'text': 'On a sunny beach',
          'icon': 'place_beach',
          'value': 'on a sunny beach',
          'exclude': [],
        },
      ],
    },
    /** CHALLENGE */
    {
      'key': 'challenge',
      'text': 'What challenge does the main character encounter?',
      'choices': [
        {
          'text': 'Being lost',
          'icon': 'challenge_lost',
          'value': 'being lost',
          'exclude': [],
        },
        {
          'text': 'Captured by a witch',
          'icon': 'challenge_witch',
          'value': 'being captured by a witch',
          'exclude': [],
        },
        {
          'text': 'Fighting a big animal',
          'icon': 'challenge_animal',
          'value': 'fighting a big animal',
          'exclude': [],
        },
        {
          'text': 'Rescuing a friend',
          'icon': 'challenge_friend',
          'value': 'rescuing a friend',
          'exclude': [],
        },
        {
          'text': 'Solving a riddle',
          'icon': 'challenge_riddle',
          'value': 'solving a riddle',
          'exclude': [],
        },
      ],
    },
    /** POWER */
    {
      'key': 'power',
      'text': 'The main character...',
      'choices': [
        {
          'text': 'Is able to fly',
          'icon': 'power_fly',
          'value': 'able to fly',
          'exclude': ['dove', 'dragon'],
        },
        {
          'text': 'Can communicate with animals',
          'icon': 'power_animals',
          'value': 'able to communicate with animals',
          'exclude': ['dove', 'dragon', 'horse'],
        },
        {
          'text': 'Can become invisible',
          'icon': 'power_invisible',
          'value': 'able to become invisible',
          'exclude': [],
        },
        {
          'text': 'Can control the weather',
          'icon': 'power_weather',
          'value': 'able to control the weather',
          'exclude': [],
        },
        {
          'text': 'Can heal the others',
          'icon': 'power_heal',
          'value': 'able to heal the others',
          'exclude': [],
        },
        {
          'text': 'Can read minds',
          'icon': 'power_minds',
          'value': 'able to read minds',
          'exclude': [],
        },
      ],
    },
    /** OBJECT */
    {
      'key': 'object',
      'text': 'Choose an important object',
      'choices': [
        {
          'text': 'A magical ring',
          'icon': 'object_ring',
          'value': 'a magical ring',
          'exclude': [],
        },
        {
          'text': 'A powerful amulet',
          'icon': 'object_amulet',
          'value': 'a powerful amulet',
          'exclude': [],
        },
        {
          'text': 'An enchanted shield',
          'icon': 'object_shield',
          'value': 'an enchanted shield',
          'exclude': [],
        },
        {
          'text': 'A rare flower',
          'icon': 'object_flower',
          'value': 'an rare flower',
          'exclude': [],
        },
        {
          'text': 'A big diamond',
          'icon': 'object_diamond',
          'value': 'a big diamond',
          'exclude': [],
        },
      ],
    },
    /** MORAL */
    {
      'key': 'moral',
      'text': 'Choose the moral of the story',
      'choices': [
        {
          'text': 'Always believe in yourself',
          'icon': 'moral_believe',
          'value': 'Always believe in yourself.',
          'exclude': [],
        },
        {
          'text': 'Never, ever, give up',
          'icon': 'moral_never_give_up',
          'value': 'Never, ever, give up.',
          'exclude': [],
        },
        {
          'text': 'Honesty is the best policy',
          'icon': 'moral_honesty',
          'value': 'Honesty is the best policy.',
          'exclude': [],
        },
        {
          'text': 'Treat others kindly',
          'icon': 'moral_others',
          'value': 'Treat others kindly.',
          'exclude': [],
        },
        {
          'text': 'True beauty comes from within',
          'icon': 'moral_beauty',
          'value': 'True beauty comes from within.',
          'exclude': [],
        },
        {
          'text': 'Do what is right, not what is easy',
          'icon': 'moral_what_is_right',
          'value': 'Do what is right, not what is easy.',
          'exclude': [],
        },
      ],
    }
  ];

  List<dynamic> questions = [
    {'key': 'characterName', 'answer': characterName},
    {'key': 'characterType', 'answer': characterType}
  ];

  // Create a random list of indices for required questions
  List<int> requiredIndices = [for (var i = 0; i < templates.length; i += 1) i]
    ..shuffle();
  requiredIndices = requiredIndices.take(numRequiredQuestions).toList();

  templates.asMap().forEach((index, template) {
    // Remove the choices forbidden to the character
    var choices = List.from(template['choices']! as List<Map<String, dynamic>>,
        growable: true);
    choices.removeWhere((choice) {
      if (!choice.containsKey('exclude')) {
        return false;
      }
      var exclude = choice['exclude'] as List;
      if (exclude.isEmpty) {
        return false;
      }
      return exclude.contains(characterType);
    });
    choices.shuffle();

    if (requiredIndices.contains(index)) {
      // The question is required: copy the template as a question
      questions.add({
        'key': template['key'],
        'text': template['text'],
        'choices': choices,
      });
    } else {
      // Choose a random answer for the user
      questions.add({
        'key': template['key'],
        'answer': choices.first['value'],
      });
    }
  });

  questions.add({
    'key': 'duration',
    'text': 'How long should the story be?',
    'choices': [
      {
        'text': 'Short (2 min)',
        'icon': 'duration_short',
        'value': '2',
        'exclude': [],
      },
      {
        'text': 'Long (5 min)',
        'icon': 'duration_long',
        'value': '5',
        'exclude': [],
      },
    ],
  });

  return questions;
}

String loadingGetLottieUrl() {
  final List<String> stringList = [
    "https://assets4.lottiefiles.com/private_files/lf30_uqcbmc4h.json",
    "https://assets4.lottiefiles.com/packages/lf20_OT15QW.json"
  ];
  var random = new math.Random();
  int randomIndex = random.nextInt(stringList.length);
  final String lottieUrl = stringList[randomIndex];
  return lottieUrl;
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

int utilsGetNextQuestionIndex(
  int start,
  List<dynamic> questions,
) {
  for (var i = start; i < questions.length; i++) {
    if (!questions[i].containsKey('answer')) {
      return i;
    }
  }
  return questions.length;
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

String loadingGetRivePath() {
  final List<String> stringList = ["assets/sloth.riv", "assets/cat.riv"];
  var random = new math.Random();
  int randomIndex = random.nextInt(stringList.length);
  return stringList[randomIndex];
}
