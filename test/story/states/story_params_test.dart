import 'package:bedtime_writer/story/states/story_params.dart';
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
  style: 'Handersen',
  character: partialCharacter,
  duration: 3,
  place: 'at some place',
);
const fullStory = StoryParams(
  style: 'Handersen',
  character: fullCharacter,
  duration: 3,
  place: 'at some place',
  object: 'some object',
  moral: 'some moral',
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

    test('.description is the full description', () {
      expect(
        fullCharacter.description,
        ' The protagonist is Someone. It has a flaw. '
        'It has a power. '
        'It is challenged with having a challenge.',
      );
    });

    test('.description is the partial description', () {
      expect(
        partialCharacter.description,
        ' The protagonist is Someone. It has a flaw.',
      );
    });
  });

  group('StoryParams', () {
    test('.copyWith() updates the fields', () {
      var copy = partialStory.copyWith(
        character: partialStory.character?.copyWith(flaw: 'has another flaw'),
        duration: 10,
        place: 'at another place',
        object: 'another object',
        moral: 'another moral',
      );

      expect(copy.character!.name, 'Someone');
      expect(copy.character!.type, 'some type');
      expect(copy.character!.flaw, 'has another flaw');
      expect(copy.duration, 10);
      expect(copy.place, 'at another place');
      expect(copy.object, 'another object');
      expect(copy.moral, 'another moral');
    });

    test('.prompt is the full prompt', () {
      expect(
        fullStory.prompt,
        'Write a fairy tale, in the style of Handersen. '
        'The protagonist is Someone. It has a flaw. It has a power. '
        'It is challenged with having a challenge. '
        'The story happens at some place. '
        'The protagonist finds some object in the journey. '
        'The moral is some moral. '
        'The length is about 300 words.',
      );
    });

    test('.prompt is the partial prompt', () {
      expect(
        partialStory.prompt,
        'Write a fairy tale, in the style of Handersen. '
        'The protagonist is Someone. It has a flaw. '
        'The story happens at some place. '
        'The length is about 300 words.',
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
