import 'package:flutter/material.dart';

import '../../backend/story_form.dart';

final StoryForm storyForm = StoryForm(
  questions: [
    characterName,
    place,
    object,
    characterFlaw,
    characterPower,
    characterChallenge,
  ],
);

final characterName = Question(
  id: 'characterName',
  text: "Who is the hero of tonight's story?",
  choices: [
    Choice(
      id: 'blaze',
      text: 'Blaze, the kind dragon',
      image: Image.asset('assets/story/character/dragon.png'),
    ),
    Choice(
      id: 'sparkles',
      text: 'Sparkles, the magical horse',
      image: Image.asset('assets/story/character/horse.png'),
    ),
    Choice(
      id: 'frosty',
      text: 'Frosty, the pinguin',
      image: Image.asset('assets/story/character/pinguin.png'),
    ),
  ],
);

final place = Question(
  id: 'place',
  text: 'Where does the story take place?',
  choices: [
    Choice(
      id: 'magic',
      text: 'In a magical forest',
      image: Image.asset('assets/story/place/magic.png'),
    ),
    Choice(
      id: 'village',
      text: 'In a quiet village',
      image: Image.asset('assets/story/place/village.png'),
    ),
    Choice(
      id: 'underwater',
      text: 'In an underwater kingdom',
      image: Image.asset('assets/story/place/underwater.png'),
    ),
    Choice(
      id: 'space',
      text: 'In a space station',
      image: Image.asset('assets/story/place/space.png'),
    ),
    Choice(
      id: 'desert',
      text: 'In a dry desert',
      image: Image.asset('assets/story/place/desert.png'),
    ),
    Choice(
      id: 'beach',
      text: 'On a sunny beach',
      image: Image.asset('assets/story/place/beach.png'),
    ),
  ],
);

Question object = Question(
  id: 'object',
  text: 'What object does the hero find?',
  choices: [
    Choice(
      id: 'ring',
      text: 'A magical ring',
      image: Image.asset('assets/story/object/ring.png'),
    ),
    Choice(
      id: 'amulet',
      text: 'A powerful amulet',
      image: Image.asset('assets/story/object/amulet.png'),
    ),
    Choice(
      id: 'shield',
      text: 'An enchanted shield',
      image: Image.asset('assets/story/object/shield.png'),
    ),
    Choice(
      id: 'flower',
      text: 'A rare flower',
      image: Image.asset('assets/story/object/flower.png'),
    ),
    Choice(
      id: 'diamond',
      text: 'A big diamond',
      image: Image.asset('assets/story/object/diamond.png'),
    ),
  ],
);

final characterFlaw = Question(
  id: 'characterFlaw',
  text: 'What flaw does the hero have?',
  choices: [
    Choice(
      id: 'failure',
      text: 'Being afraid of failure',
      image: Image.asset('assets/story/flaw/failure.png'),
    ),
    Choice(
      id: 'self_confidence',
      text: 'Lacking self-confidence',
      image: Image.asset('assets/story/flaw/self_confidence.png'),
    ),
    Choice(
      id: 'lazy',
      text: 'Being a bit lazy',
      image: Image.asset('assets/story/flaw/lazy.png'),
    ),
    Choice(
      id: 'give_up',
      text: 'Giving up easily',
      image: Image.asset('assets/story/flaw/give_up.png'),
    ),
    Choice(
      id: 'no_advice',
      text: 'Not listening to advice',
      image: Image.asset('assets/story/flaw/no_advice.png'),
    ),
  ],
);

final characterPower = Question(
  id: 'characterPower',
  text: 'What power does the hero have?',
  choices: [
    Choice(
      id: 'fly',
      text: 'Is able to fly',
      image: Image.asset('assets/story/power/fly.png'),
    ),
    Choice(
      id: 'animals',
      text: 'Can communicate with animals',
      image: Image.asset('assets/story/power/animals.png'),
    ),
    Choice(
      id: 'invisible',
      text: 'Can become invisible',
      image: Image.asset('assets/story/power/invisible.png'),
    ),
    Choice(
      id: 'weather',
      text: 'Can control the weather',
      image: Image.asset('assets/story/power/weather.png'),
    ),
    Choice(
      id: 'heal',
      text: 'Can heal the others',
      image: Image.asset('assets/story/power/heal.png'),
    ),
    Choice(
      id: 'minds',
      text: 'Can read minds',
      image: Image.asset('assets/story/power/minds.png'),
    ),
  ],
);

final characterChallenge = Question(
  id: 'characterChallenge',
  text: 'What challenge awaits the hero?',
  choices: [
    Choice(
      id: 'lost',
      text: 'Being lost',
      image: Image.asset('assets/story/challenge/lost.png'),
    ),
    Choice(
      id: 'witch',
      text: 'Captured by a witch',
      image: Image.asset('assets/story/challenge/witch.png'),
    ),
    Choice(
      id: 'animal',
      text: 'Fighting a big animal',
      image: Image.asset('assets/story/challenge/animal.png'),
    ),
    Choice(
      id: 'friend',
      text: 'Rescuing a friend',
      image: Image.asset('assets/story/challenge/friend.png'),
    ),
    Choice(
      id: 'riddle',
      text: 'Solving a riddle',
      image: Image.asset('assets/story/challenge/riddle.png'),
    ),
  ],
);
