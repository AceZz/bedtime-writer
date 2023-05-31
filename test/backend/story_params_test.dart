import 'package:bedtime_writer/backend/story_params.dart';
import 'package:test/test.dart';

const partialCharacter = Character(
  name: 'Someone',
  type: 'some type',
  flaw: 'has a flaw',
);
const fullCharacter = Character(
  name: 'Someone',
  type: 'some type',
  flaw: 'has a flaw',
  power: 'has a power',
  challenge: 'having a challenge',
);
const partialStory = StoryParams(
  style: 'Andersen',
  character: partialCharacter,
  duration: 3,
  place: 'at some place',
);
const fullStory = StoryParams(
  style: 'Andersen',
  character: fullCharacter,
  duration: 3,
  place: 'at some place',
  object: 'some object',
);

void main() {
  group('Character', () {
    test('.copyWith() updates the fields', () {
      var copy = partialCharacter.copyWith(
        flaw: 'has another flaw',
        power: 'has a power',
        challenge: 'having a challenge',
      );

      expect(copy.name, 'Someone');
      expect(copy.type, 'some type');
      expect(copy.flaw, 'has another flaw');
      expect(copy.power, 'has a power');
      expect(copy.challenge, 'having a challenge');
    });

    test('.serialize() returns a full serialization', () {
      expect(fullCharacter.serialize(), {
        'characterName': 'Someone',
        'characterFlaw': 'has a flaw',
        'characterPower': 'has a power',
        'characterChallenge': 'having a challenge',
      });
    });

    test('.serialize() returns a partial serialization', () {
      expect(partialCharacter.serialize(), {
        'characterName': 'Someone',
        'characterFlaw': 'has a flaw',
      });
    });
  });

  group('StoryParams', () {
    test('.copyWith() updates the fields', () {
      var copy = partialStory.copyWith(
        character: partialStory.character?.copyWith(flaw: 'has another flaw'),
        duration: 10,
        place: 'at another place',
        object: 'another object',
      );

      expect(copy.character!.name, 'Someone');
      expect(copy.character!.type, 'some type');
      expect(copy.character!.flaw, 'has another flaw');
      expect(copy.duration, 10);
      expect(copy.place, 'at another place');
      expect(copy.object, 'another object');
    });

    test('.serialize() returns a full serialization', () {
      expect(fullStory.serialize(), {
        'style': 'Andersen',
        'duration': 3,
        'place': 'at some place',
        'object': 'some object',
        'characterName': 'Someone',
        'characterFlaw': 'has a flaw',
        'characterPower': 'has a power',
        'characterChallenge': 'having a challenge',
      });
    });

    test('.serialize() returns a partial serialization', () {
      expect(partialStory.serialize(), {
        'style': 'Andersen',
        'duration': 3,
        'place': 'at some place',
        'characterName': 'Someone',
        'characterFlaw': 'has a flaw',
      });
    });
  });

  group('Choice', () {
    test('isValid() works', () {
      var choice = Choice<String>(
        text: 'my choice',
        value: 'value',
        isAvailable: (story) => story.duration == 5,
      );

      expect(choice.isAvailable(partialStory), false);
      expect(choice.isAvailable(partialStory.copyWith(duration: 5)), true);
    });
  });

  group('Question', () {
    test('answer() works', () {
      var choice = Choice<String>(
        text: 'choice',
        value: 'a new object',
        isAvailable: (story) => story.duration == 3,
      );

      var question = Question(
        text: 'question text',
        choices: [choice],
        answer: (story, choice) => story.copyWith(object: choice.value),
      );

      expect(
        question.answer(partialStory, choice).object,
        'a new object',
      );
    });

    test('availableChoices() returns the correct choices', () {
      var choice1 = Choice<String>(
        text: 'choice 1',
        value: 'object 1',
        isAvailable: (story) => story.duration == 3,
      );
      var choice2 = Choice<String>(
        text: 'choice 2',
        value: 'object 2',
        isAvailable: (story) => story.duration == 5,
      );
      var choice3 = Choice<String>(
        text: 'choice 3',
        value: 'object 3',
      );

      var question = Question(
        text: 'question text',
        choices: [choice1, choice2, choice3],
        answer: (story, choice) => story.copyWith(object: choice.value),
      );

      expect(question.availableChoices(partialStory), [choice1, choice3]);
      expect(
        question.availableChoices(partialStory.copyWith(duration: 5)),
        [choice2, choice3],
      );
    });
  });

  test('answerRandom() uses one of the expected choices', () {
    var choice1 = Choice<String>(
      text: 'choice 1',
      value: 'object 1',
      isAvailable: (story) => story.duration == 3,
    );
    var choice2 = Choice<String>(
      text: 'choice 2',
      value: 'object 2',
      isAvailable: (story) => story.duration == 5,
    );
    var choice3 = Choice<String>(
      text: 'choice 3',
      value: 'object 3',
    );

    var question = Question(
      text: 'question text',
      choices: [choice1, choice2, choice3],
      answer: (story, choice) => story.copyWith(object: choice.value),
    );

    // Hack until Random is mocked.
    for (var i = 0; i < 10; i++) {
      expect(
        ['object 1', 'object 3']
            .contains(question.answerRandom(partialStory).object),
        true,
      );
    }
  });
}
