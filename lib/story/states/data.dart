import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import 'story_params.dart';

/// CHARACTERS

const Choice characterBlaze = const Choice<Character>(
  text: 'Blaze, the kind dragon',
  value: const Character(
    name: 'Blaze, the kind dragon',
    type: 'dragon',
  ),
  icon: FontAwesomeIcons.dragon,
);

const Choice characterSparkles = const Choice<Character>(
  text: 'Sparkles, the magical horse',
  value: const Character(
    name: 'Sparkles, the magical horse',
    type: 'horse',
  ),
  icon: FontAwesomeIcons.horseHead,
);

const Choice characterCourage = const Choice<Character>(
  text: 'Captain Courage, the pirate',
  value: const Character(
    name: 'Captain Courage, the pirate',
    type: 'pirate',
  ),
  icon: FontAwesomeIcons.skullCrossbones,
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

const Choice flawFailure = const Choice<String>(
  text: 'Being afraid of failure',
  value: 'being afraid of failure',
  icon: FontAwesomeIcons.triangleExclamation,
);

const Choice flawSelfConfidence = const Choice<String>(
  text: 'Lacking self-confidence',
  value: 'lacking self-confidence',
  icon: FontAwesomeIcons.comment,
);

const Choice flawLazy = const Choice<String>(
  text: 'Being a bit lazy',
  value: 'being a bit lazy',
  icon: FontAwesomeIcons.pause,
);

const Choice flawGiveUp = const Choice<String>(
  text: 'Giving up easily',
  value: 'being a bit lazy',
  icon: FontAwesomeIcons.xmark,
);

const Choice flawUgly = const Choice<String>(
  text: 'Thinking they are ugly',
  value: 'being a bit lazy',
  icon: FontAwesomeIcons.heartCrack,
);

const Choice flawNoAdvice = const Choice<String>(
  text: 'Not listening to advice',
  value: 'not listening to advice',
  icon: FontAwesomeIcons.earDeaf,
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

const Choice placeMagic = const Choice<String>(
  text: 'In a magical forest',
  icon: FontAwesomeIcons.wandMagicSparkles,
  value: 'in a magical forest',
);

const Choice placeVillage = const Choice<String>(
  text: 'In a quiet village',
  icon: FontAwesomeIcons.houseChimney,
  value: 'in a quiet village',
);

Choice placeUnderwater = Choice<String>(
  text: 'In an underwater kingdom',
  icon: FontAwesomeIcons.water,
  value: 'in an underwater kingdom',
  isAvailable: (story) => story.character?.type != 'horse',
);

const Choice placeSpace = const Choice<String>(
  text: 'In a space station',
  icon: FontAwesomeIcons.rocket,
  value: 'in a space station',
);

const Choice placeDesert = const Choice<String>(
  text: 'In a dry desert',
  icon: FontAwesomeIcons.sunPlantWilt,
  value: 'in a dry desert',
);

const Choice placeBeach = const Choice<String>(
  text: 'On a sunny beach',
  icon: FontAwesomeIcons.umbrellaBeach,
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

const Choice challengeLost = const Choice<String>(
  text: 'Being lost',
  icon: FontAwesomeIcons.map,
  value: 'being lost',
);

const Choice challengeWitch = const Choice<String>(
  text: 'Captured by a witch',
  icon: FontAwesomeIcons.dungeon,
  value: 'being captured by a witch',
);

const Choice challengeAnimal = const Choice<String>(
  text: 'Fighting a big animal',
  icon: FontAwesomeIcons.cow,
  value: 'fighting a big animal',
);

const Choice challengeFriend = const Choice<String>(
  text: 'Rescuing a friend',
  icon: FontAwesomeIcons.userGroup,
  value: 'rescuing a friend',
);

const Choice challengeRiddle = const Choice<String>(
  text: 'Solving a riddle',
  icon: FontAwesomeIcons.question,
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
  icon: FontAwesomeIcons.feather,
  value: 'able to fly',
  isAvailable: (story) => !['dove', 'dragon'].contains(story.character?.type),
);

Choice powerAnimals = Choice<String>(
  text: 'Can communicate with animals',
  icon: FontAwesomeIcons.cow,
  value: 'able to communicate with animals',
  isAvailable: (story) =>
      !['dove', 'dragon', 'horse'].contains(story.character?.type),
);

const Choice powerInvisible = const Choice<String>(
  text: 'Can become invisible',
  icon: FontAwesomeIcons.eyeSlash,
  value: 'able to become invisible',
);

const Choice powerWeather = const Choice<String>(
  text: 'Can control the weather',
  icon: FontAwesomeIcons.cloud,
  value: 'able to control the weather',
);

const Choice powerHeal = const Choice<String>(
  text: 'Can heal the others',
  icon: FontAwesomeIcons.briefcaseMedical,
  value: 'able to heal the others',
);

const Choice powerMinds = const Choice<String>(
  text: 'Can read minds',
  icon: FontAwesomeIcons.brain,
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

const Choice objectRing = const Choice<String>(
  text: 'A magical ring',
  icon: FontAwesomeIcons.ring,
  value: 'a magical ring',
);

const Choice objectAmulet = const Choice<String>(
  text: 'A powerful amulet',
  icon: FontAwesomeIcons.ankh,
  value: 'a powerful amulet',
);

const Choice objectShield = const Choice<String>(
  text: 'An enchanted shield',
  icon: FontAwesomeIcons.shield,
  value: 'an enchanted shield',
);

const Choice objectFlower = const Choice<String>(
  text: 'A rare flower',
  icon: FontAwesomeIcons.leaf,
  value: 'an rare flower',
);

const Choice objectDiamond = const Choice<String>(
  text: 'A big diamond',
  icon: FontAwesomeIcons.gem,
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

const Choice moralBelieve = const Choice<String>(
  text: 'Always believe in yourself',
  icon: FontAwesomeIcons.star,
  value: 'Always believe in yourself',
);

const Choice moralNoGiveUp = const Choice<String>(
  text: 'Never, ever, give up',
  icon: FontAwesomeIcons.star,
  value: 'Never, ever, give up',
);

const Choice moralHonesty = const Choice<String>(
  text: 'Honesty is the best policy',
  icon: FontAwesomeIcons.star,
  value: 'Honesty is the best policy',
);

const Choice moralKindToOthers = const Choice<String>(
  text: 'Treat others kindly',
  icon: FontAwesomeIcons.star,
  value: 'Treat others kindly',
);

const Choice moralBeauty = const Choice<String>(
  text: 'True beauty comes from within',
  icon: FontAwesomeIcons.star,
  value: 'True beauty comes from within',
);

const Choice moralRight = const Choice<String>(
  text: 'Do what is right, not what is easy',
  icon: FontAwesomeIcons.star,
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

const Choice durationShort = const Choice<int>(
  text: 'Short (2 mins)',
  icon: FontAwesomeIcons.bolt,
  value: 2,
);

const Choice durationLong = const Choice<int>(
  text: 'Long (5 mins)',
  icon: FontAwesomeIcons.clock,
  value: 5,
);

Question durationQuestion = Question(
  text: 'How long should the story be?',
  choices: [durationShort, durationLong],
  randomAllowed: false,
  answer: ((story, choice) => story.copyWith(duration: choice.value)),
);
