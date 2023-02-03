import 'package:bedtime_writer/story/states/story_params.dart';
import 'package:test/test.dart';

const partialCharacter = Character(name: 'name', type: 'type', flaw: 'flaw');
const fullCharacter = Character(
  name: 'name',
  type: 'type',
  flaw: 'flaw',
  power: 'power',
  challenge: 'challenge',
);
const partialStory = StoryParams(
  character: partialCharacter,
  age: 7,
  duration: 3,
  place: 'place',
);
const fullStory = StoryParams(
  character: fullCharacter,
  age: 7,
  duration: 3,
  place: 'at place',
  object: 'object',
  moral: 'moral',
);

void main() {
  group('Character', () {
    test('.copyWith() updates the fields', () {
      var copy = partialCharacter.copyWith(
          flaw: 'another flaw', power: 'power', challenge: 'challenge');

      expect(copy.name, 'name');
      expect(copy.type, 'type');
      expect(copy.flaw, 'another flaw');
      expect(copy.power, 'power');
      expect(copy.challenge, 'challenge');
    });

    test('.description is the full description', () {
      expect(
        fullCharacter.description,
        ' The main character of the story is name, a type. '
        'It has a flaw: flaw. '
        'It has a power: power. '
        'It will be challenged with challenge.',
      );
    });

    test('.description is the partial description', () {
      expect(
          partialCharacter.description,
          ' The main character of the story is name, a type. '
          'It has a flaw: flaw.');
    });
  });

  group('StoryParams', () {
    test('.copyWith() updates the fields', () {
      var copy = partialStory.copyWith(
        character: partialStory.character?.copyWith(flaw: 'another flaw'),
        age: 3,
        duration: 10,
        place: 'another place',
        object: 'object',
        moral: 'moral',
      );

      expect(copy.character!.name, 'name');
      expect(copy.character!.type, 'type');
      expect(copy.character!.flaw, 'another flaw');
      expect(copy.age, 3);
      expect(copy.duration, 10);
      expect(copy.place, 'another place');
      expect(copy.object, 'object');
      expect(copy.moral, 'moral');
    });

    test('.prompt is the full prompt', () {
      expect(
        fullStory.prompt,
        'Act as a storyteller. '
        'Tell a bedtime story, with details, for a 7-year old. '
        'It should last about 3 minutes. '
        'The main character of the story is name, a type. '
        'It has a flaw: flaw. '
        'It has a power: power. '
        'It will be challenged with challenge. '
        'The story happens at place. '
        'This object shall be important: object. '
        'The story shall end well and with this moral: moral.',
      );
    });

    test('.prompt is the partial prompt', () {
      expect(
        partialStory.prompt,
        'Act as a storyteller. '
        'Tell a bedtime story, with details, for a 7-year old. '
        'It should last about 3 minutes. '
        'The main character of the story is name, a type. '
        'It has a flaw: flaw. '
        'The story happens place. '
        'The story shall end well.',
      );
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
        value: 'a new moral',
        isAvailable: (story) => story.duration == 3,
      );

      var question = Question(
        text: 'question text',
        choices: [choice],
        answer: (story, choice) => story.copyWith(moral: choice.value),
      );

      expect(
        question.answer(partialStory, choice).moral,
        'a new moral',
      );
    });

    test('availableChoices() returns the correct choices', () {
      var choice1 = Choice<String>(
        text: 'choice 1',
        value: 'moral 1',
        isAvailable: (story) => story.duration == 3,
      );
      var choice2 = Choice<String>(
        text: 'choice 2',
        value: 'moral 2',
        isAvailable: (story) => story.duration == 5,
      );
      var choice3 = Choice<String>(
        text: 'choice 3',
        value: 'moral 3',
        isAvailable: (story) => story.age == 7,
      );

      var question = Question(
        text: 'question text',
        choices: [choice1, choice2, choice3],
        answer: (story, choice) => story.copyWith(moral: choice.value),
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
      value: 'moral 1',
      isAvailable: (story) => story.duration == 3,
    );
    var choice2 = Choice<String>(
      text: 'choice 2',
      value: 'moral 2',
      isAvailable: (story) => story.duration == 5,
    );
    var choice3 = Choice<String>(
      text: 'choice 3',
      value: 'moral 3',
      isAvailable: (story) => story.age == 7,
    );

    var question = Question(
      text: 'question text',
      choices: [choice1, choice2, choice3],
      answer: (story, choice) => story.copyWith(moral: choice.value),
    );

    // Hack until Random is mocked.
    for (var i = 0; i < 10; i++) {
      expect(
        ['moral 1', 'moral 3']
            .contains(question.answerRandom(partialStory).moral),
        true,
      );
    }
  });
}
