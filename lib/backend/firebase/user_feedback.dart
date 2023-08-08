import 'firebase.dart';
import '../user_feedback.dart';

Future<void> firebaseCollectUserFeedback(UserFeedback feedback) async {
  await firebaseFunctions
      .httpsCallable('collectUserFeedback') //TODO: write this in backend
      .call(feedback.serialize());
}
