import 'firebase.dart';
import '../user_feedback.dart';

Future<void> firebaseCollectUserFeedback(UserFeedback feedback) async {
  await firebaseFunctions
      .httpsCallable('collectUserFeedback')
      .call(feedback.serialize());
}
