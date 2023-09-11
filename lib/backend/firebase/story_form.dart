import 'dart:typed_data';

import 'package:cloud_firestore/cloud_firestore.dart';

import '../story_form.dart';
import 'firebase.dart';

Future<FirebaseStoryForm> firebaseGetRandomStoryForm() async {
  final documents = await firebaseFirestore
      .collection(storyFormsLanding) //TODO: change this to serving
      .limit(1) //TODO: randomize
      .get();
  final id = documents.docs[0].id;
  return FirebaseStoryForm.get(id);
}

/// Firebase implementation of [StoryForm].
class FirebaseStoryForm implements StoryForm {
  final String id;
  @override
  final List<Question> questions;

  /// Download a [StoryForm], including its [Question]s and [Choice]s, and
  /// return it.
  static Future<FirebaseStoryForm> get(String id) async {
    //TODO: change colleciton below to storyFormsServing
    final ref = firebaseFirestore.collection(storyFormsLanding).doc(id);
    final data = (await getCacheThenServer(ref)).data()!;

    final questions = [];
    for (int i = 0; i < data['numQuestions']; i++) {
      final questionId = data['question$i'] as String;
      final choiceIds = data['question${i}Choices'].cast<String>();
      questions.add(await _FirebaseQuestion.get(questionId, choiceIds));
    }

    return FirebaseStoryForm(id, questions.cast<Question>());
  }

  const FirebaseStoryForm(this.id, this.questions) : super();

  @override
  String toString() => '_FirebaseStoryForm($id, $questions)';
}

/// Firebase implementation of [Question].
class _FirebaseQuestion implements Question {
  @override
  final String id;
  @override
  final String text;
  @override
  final List<Choice> choices;

  static Future<_FirebaseQuestion> get(
    String id,
    List<String> choiceIds,
  ) async {
    //TODO: update collection below to storyQuestionsServing
    final ref = firebaseFirestore.collection(storyQuestions).doc(id);
    final data = (await getCacheThenServer(ref)).data()!;

    final choices = await Future.wait(
      choiceIds.map((choiceId) async {
        return _FirebaseChoice.get(ref, choiceId);
      }),
    );

    return _FirebaseQuestion(id, data['text'], choices);
  }

  const _FirebaseQuestion(this.id, this.text, this.choices) : super();

  @override
  String toString() => '_FirebaseQuestion($id, $text, $choices)';
}

/// Firebase implementation of [Choice].
class _FirebaseChoice implements Choice {
  @override
  final String id;
  @override
  final String text;
  @override
  final Uint8List? image;

  static Future<_FirebaseChoice> get(
    DocumentReference storyRef,
    String id,
  ) async {
    final ref = storyRef.collection(storyQuestionChoices).doc(id);
    final data = (await getCacheThenServer(ref)).data()!;

    return _FirebaseChoice(id, data['text'], data['image'].bytes);
  }

  const _FirebaseChoice(this.id, this.text, this.image) : super();

  @override
  String toString() => '_FirebaseChoice($id, $text)';
}
