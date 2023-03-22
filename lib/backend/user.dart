import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'firebase/user.dart';

/// Evaluates to true if the user is authenticated.
bool isUserAuthenticated(User? user) => user != null;

/// Evaluates to true if the user is authenticated but anonymous.
bool isUserAnonymous(User? user) {
  if (isUserAuthenticated(user)) return user?.providerData.isEmpty ?? false;
  return false;
}

final userProvider = StreamProvider<User?>((ref) {
  return firebaseAuth.authStateChanges();
});

/// Evaluates to true if the user is anonymous.
final isUserAnonymousProvider = Provider<bool>((ref) {
  final user = ref.watch(userProvider);
  return isUserAnonymous(user.value);
});
