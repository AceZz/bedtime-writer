import 'dart:typed_data';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../story_form.dart';
import 'firebase.dart';

final storyFormProvider =
    Provider<FirebaseStoryForm>((ref) => throw UnimplementedError());

/// Firebase implementation of [StoryForm].
class FirebaseStoryForm implements StoryForm {
  final String id;
  final List<Question> questions;

  /// Download a [StoryForm], including its [Question]s and [Choice]s, and
  /// return it.
  static Future<FirebaseStoryForm> get(String id) async {
    final ref = firebaseFirestore.collection(STORY_FORMS).doc(id);
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

  String toString() => '_FirebaseStoryForm($id, $questions)';
}

/// Firebase implementation of [Question].
class _FirebaseQuestion implements Question {
  final String id;
  final String text;
  final List<Choice> choices;

  static Future<_FirebaseQuestion> get(
    String id,
    List<String> choiceIds,
  ) async {
    final ref = firebaseFirestore.collection(STORY_QUESTIONS).doc(id);
    final data = (await getCacheThenServer(ref)).data()!;

    final choices = await Future.wait(choiceIds.map((choiceId) async {
      return _FirebaseChoice.get(ref, choiceId);
    }));

    return _FirebaseQuestion(id, data['text'], choices);
  }

  const _FirebaseQuestion(this.id, this.text, this.choices) : super();

  String toString() => '_FirebaseQuestion($id, $text, $choices)';
}

/// Firebase implementation of [Choice].
class _FirebaseChoice implements Choice {
  final String id;
  final String text;
  final Uint8List? image;

  static Future<_FirebaseChoice> get(
    DocumentReference storyRef,
    String id,
  ) async {
    final ref = storyRef.collection(STORY_QUESTIONS_CHOICES).doc(id);
    final data = (await getCacheThenServer(ref)).data()!;

    return _FirebaseChoice(id, data['text'], data['image'].bytes);
  }

  const _FirebaseChoice(this.id, this.text, this.image) : super();

  String toString() => '_FirebaseChoice($id, $text)';
}
