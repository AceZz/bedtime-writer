import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../firebase_options.dart';
import '../user.dart';
import 'firebase.dart';

/// Instantiate a [User] managed by Firebase.
User getFirebaseUser(ProviderRef<User> ref) {
  final firebaseUser = ref.watch(_firebaseUserProvider).value;

  if (firebaseUser == null) {
    return _FirebaseUnauthUser();
  }

  if (firebaseUser.providerData.isEmpty) {
    return _FirebaseAnonymousUser(firebaseUser);
  }
  return _FirebaseRegisteredUser(firebaseUser);
}

final _firebaseUserProvider = StreamProvider<firebase_auth.User?>((ref) {
  return firebaseAuth.userChanges();
});

/// A [User] managed by Firebase.
abstract class _FirebaseUser with GoogleAuthMixin implements User {
  const _FirebaseUser();

  bool _credentialAlreadyUsed(firebase_auth.FirebaseAuthException e) {
    return e.code == 'credential-already-in-use';
  }

  /// Displays a Google sign in form, returns the Google credential.
  Future<firebase_auth.OAuthCredential> _getGoogleCredential() async {
    final googleAuth = await getGoogleAuth(clientId: _clientId);

    return firebase_auth.GoogleAuthProvider.credential(
      accessToken: googleAuth?.accessToken,
      idToken: googleAuth?.idToken,
    );
  }

  /// Only used for iOS for now.
  String? get _clientId {
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.iOS)
      return DefaultFirebaseOptions.currentPlatform.iosClientId;
    return null;
  }
}

/// A [UnauthUser] managed by Firebase.
class _FirebaseUnauthUser extends _FirebaseUser implements UnauthUser {
  const _FirebaseUnauthUser() : super();

  @override
  String toString() => 'Unauthenticated Firebase user';

  @override
  Future signInAnonymously() {
    return firebaseAuth.signInAnonymously();
  }

  @override
  Future signInWithGoogle() async {
    if (kIsWeb) {
      final provider = firebase_auth.GoogleAuthProvider();
      return firebaseAuth.signInWithPopup(provider);
    }

    final credential = await _getGoogleCredential();
    return firebaseAuth.signInWithCredential(credential);
  }
}

/// An [AuthUser] managed by Firebase.
abstract class _FirebaseAuthUser extends _FirebaseUser implements AuthUser {
  final firebase_auth.User user;

  const _FirebaseAuthUser(this.user) : super();

  @override
  String get uid => user.uid;

  @override
  String? get displayName => user.displayName;

  @override
  Future signOut() {
    return firebaseAuth.signOut();
  }
}

/// An [AnonymousUser] managed by Firebase.
class _FirebaseAnonymousUser extends _FirebaseAuthUser
    implements AnonymousUser {
  const _FirebaseAnonymousUser(firebase_auth.User user) : super(user);

  @override
  String toString() => 'Anonymous Firebase user ($uid)';

  @override
  Future linkToGoogle() async {
    if (kIsWeb) {
      final provider = firebase_auth.GoogleAuthProvider();
      return firebaseAuth.signInWithPopup(provider);
    }

    final credential = await _getGoogleCredential();

    try {
      return await user.linkWithCredential(credential);
    } on firebase_auth.FirebaseAuthException catch (e) {
      if (_credentialAlreadyUsed(e)) {
        return firebaseAuth.signInWithCredential(credential);
      }
      throw e;
    }
  }
}

/// A [RegisteredUser] managed by Firebase.
class _FirebaseRegisteredUser extends _FirebaseAuthUser
    implements RegisteredUser {
  const _FirebaseRegisteredUser(firebase_auth.User user) : super(user);

  get displayName => user.displayName;

  @override
  String toString() => 'Registered Firebase user ($uid, $providers)';

  @override
  List<String> get providers =>
      user.providerData.map((provider) => provider.providerId).toList();

  @override
  Future linkToGoogle() async {
    if (kIsWeb) {
      final provider = firebase_auth.GoogleAuthProvider();
      return firebaseAuth.signInWithPopup(provider);
    }

    final credential = await _getGoogleCredential();

    try {
      return await user.linkWithCredential(credential);
    } on firebase_auth.FirebaseAuthException catch (e) {
      // If the credential is already used in another account, stay with that
      // account.
      if (!_credentialAlreadyUsed(e)) throw e;
    }
  }
}
