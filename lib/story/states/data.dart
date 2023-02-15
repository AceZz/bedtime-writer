import 'package:flutter/material.dart';

import 'story_params.dart';

/// CHARACTERS

final Choice characterBlaze = Choice<Character>(
  text: 'Blaze, the kind dragon',
  value: const Character(
    name: 'Blaze, the kind dragon',
    type: 'dragon',
  ),
  image: Image.asset('assets/choices/pinguin.png'),
);

final Choice characterSparkles = Choice<Character>(
  text: 'Sparkles, the magical horse',
  value: const Character(
    name: 'Sparkles, the magical horse',
    type: 'horse',
  ),
  image: Image.asset('assets/choices/pinguin.png'),
);

final Choice characterCourage = Choice<Character>(
  text: 'Captain Courage, the pirate',
  value: const Character(
    name: 'Captain Courage, the pirate',
    type: 'pirate',
  ),
  image: Image.asset('assets/choices/pinguin.png'),
);

Question characterQuestion = Question(
  text: "Who is the hero of tonight\'s story?",
  choices: [characterBlaze, characterSparkles, characterCourage],
  answer: ((story, choice) {
    return story.copyWith(character: choice.value);
  }),
  randomAllowed: false,
);

/// FLAWS

final Choice flawFailure = Choice<String>(
  text: 'Being afraid of failure',
  value: 'being afraid of failure',
  image: Image.asset('assets/choices/pinguin.png'),
);

final Choice flawSelfConfidence = Choice<String>(
  text: 'Lacking self-confidence',
  value: 'lacking self-confidence',
  image: Image.asset('assets/choices/pinguin.png'),
);

final Choice flawLazy = Choice<String>(
  text: 'Being a bit lazy',
  value: 'being a bit lazy',
  image: Image.asset('assets/choices/pinguin.png'),
);

final Choice flawGiveUp = Choice<String>(
  text: 'Giving up easily',
  value: 'being a bit lazy',
  image: Image.asset('assets/choices/pinguin.png'),
);

final Choice flawUgly = Choice<String>(
  text: 'Thinking they are ugly',
  value: 'being a bit lazy',
  image: Image.asset('assets/choices/pinguin.png'),
);

final Choice flawNoAdvice = Choice<String>(
  text: 'Not listening to advice',
  value: 'not listening to advice',
  image: Image.asset('assets/choices/pinguin.png'),
);

Question flawQuestion = Question(
  text: 'What flaw does the hero have?',
  choices: [
    flawFailure,
    flawSelfConfidence,
    flawLazy,
    flawGiveUp,
    flawUgly,
    flawNoAdvice
  ],
  answer: ((story, choice) {
    return story.copyWith(
        character: story.character?.copyWith(flaw: choice.value));
  }),
);

/// PLACES

final Choice placeMagic = Choice<String>(
  text: 'In a magical forest',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'in a magical forest',
);

final Choice placeVillage = Choice<String>(
  text: 'In a quiet village',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'in a quiet village',
);

final Choice placeUnderwater = Choice<String>(
  text: 'In an underwater kingdom',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'in an underwater kingdom',
  isAvailable: (story) => story.character?.type != 'horse',
);

final Choice placeSpace = Choice<String>(
  text: 'In a space station',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'in a space station',
);

final Choice placeDesert = Choice<String>(
  text: 'In a dry desert',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'in a dry desert',
);

final Choice placeBeach = Choice<String>(
  text: 'On a sunny beach',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'on a sunny beach',
);

Question placeQuestion = Question(
  text: 'Where does the story take place?',
  choices: [
    placeMagic,
    placeVillage,
    placeUnderwater,
    placeSpace,
    placeDesert,
    placeBeach,
  ],
  answer: ((story, choice) => story.copyWith(place: choice.value)),
);

/// CHALLENGES

final Choice challengeLost = Choice<String>(
  text: 'Being lost',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'being lost',
);

final Choice challengeWitch = Choice<String>(
  text: 'Captured by a witch',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'being captured by a witch',
);

final Choice challengeAnimal = Choice<String>(
  text: 'Fighting a big animal',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'fighting a big animal',
);

final Choice challengeFriend = Choice<String>(
  text: 'Rescuing a friend',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'rescuing a friend',
);

final Choice challengeRiddle = Choice<String>(
  text: 'Solving a riddle',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'solving a riddle',
);

Question challengeQuestion = Question(
  text: 'What challenge awaits the hero?',
  choices: [
    challengeLost,
    challengeWitch,
    challengeAnimal,
    challengeFriend,
    challengeRiddle,
  ],
  answer: ((story, choice) => story.copyWith(
      character: story.character?.copyWith(challenge: choice.value))),
);

/// POWERS

Choice powerFly = Choice<String>(
  text: 'Is able to fly',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'able to fly',
  isAvailable: (story) => !['dove', 'dragon'].contains(story.character?.type),
);

final Choice powerAnimals = Choice<String>(
  text: 'Can communicate with animals',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'able to communicate with animals',
  isAvailable: (story) =>
      !['dove', 'dragon', 'horse'].contains(story.character?.type),
);

final Choice powerInvisible = Choice<String>(
  text: 'Can become invisible',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'able to become invisible',
);

final Choice powerWeather = Choice<String>(
  text: 'Can control the weather',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'able to control the weather',
);

final Choice powerHeal = Choice<String>(
  text: 'Can heal the others',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'able to heal the others',
);

final Choice powerMinds = Choice<String>(
  text: 'Can read minds',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'able to read minds',
);

Question powerQuestion = Question(
  text: 'What power does the hero have?',
  choices: [
    powerFly,
    powerAnimals,
    powerInvisible,
    powerWeather,
    powerHeal,
    powerMinds,
  ],
  answer: ((story, choice) => story.copyWith(
      character: story.character?.copyWith(power: choice.value))),
);

/// OBJECTS

final Choice objectRing = Choice<String>(
  text: 'A magical ring',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'a magical ring',
);

final Choice objectAmulet = Choice<String>(
  text: 'A powerful amulet',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'a powerful amulet',
);

final Choice objectShield = Choice<String>(
  text: 'An enchanted shield',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'an enchanted shield',
);

final Choice objectFlower = Choice<String>(
  text: 'A rare flower',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'an rare flower',
);

final Choice objectDiamond = Choice<String>(
  text: 'A big diamond',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'a big diamond',
);

Question objectQuestion = Question(
  text: 'What object will be important in the story?',
  choices: [
    objectRing,
    objectAmulet,
    objectShield,
    objectFlower,
    objectDiamond,
  ],
  answer: ((story, choice) => story.copyWith(object: choice.value)),
);

/// MORALS

final Choice moralBelieve = Choice<String>(
  text: 'Always believe in yourself',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'Always believe in yourself',
);

final Choice moralNoGiveUp = Choice<String>(
  text: 'Never, ever, give up',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'Never, ever, give up',
);

final Choice moralHonesty = Choice<String>(
  text: 'Honesty is the best policy',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'Honesty is the best policy',
);

final Choice moralKindToOthers = Choice<String>(
  text: 'Treat others kindly',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'Treat others kindly',
);

final Choice moralBeauty = Choice<String>(
  text: 'True beauty comes from within',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'True beauty comes from within',
);

final Choice moralRight = Choice<String>(
  text: 'Do what is right, not what is easy',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 'Do what is right, not what is easy',
);

Question moralQuestion = Question(
  text: 'What will be the moral of the story?',
  choices: [
    moralBelieve,
    moralNoGiveUp,
    moralHonesty,
    moralKindToOthers,
    moralBeauty,
    moralRight,
  ],
  answer: ((story, choice) => story.copyWith(moral: choice.value)),
);

/// DURATION

final Choice durationShort = Choice<int>(
  text: 'Short (2 mins)',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 2,
);

final Choice durationLong = Choice<int>(
  text: 'Long (5 mins)',
  image: Image.asset('assets/choices/pinguin.png'),
  value: 5,
);

Question durationQuestion = Question(
  text: 'How long should the story be?',
  choices: [durationShort, durationLong],
  randomAllowed: false,
  answer: ((story, choice) => story.copyWith(duration: choice.value)),
);
