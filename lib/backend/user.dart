import 'package:google_sign_in/google_sign_in.dart';

/// A user of the application.
abstract class User {
  const User();
}

/// An unauthenticated [User].
abstract class UnauthUser extends User {
  const UnauthUser() : super();

  Future signInAnonymously();

  Future signInWithGoogle();

  Future signInWithEmailAndPassword({
    required String email,
    required String password,
  });

  Future createUserWithEmailAndPassword({
    required String email,
    required String password,
  });
}

/// An authenticated [User].
abstract class AuthUser extends User {
  const AuthUser() : super();

  String get uid;
  String? get displayName;

  Future linkToGoogle();

  Future signOut();
}

/// An [AuthUser] with an anonymous account.
abstract class AnonymousUser extends AuthUser {
  const AnonymousUser() : super();

  /// Links this account to a Google account. If it fails, keeps using the
  /// current account.
  @override
  Future linkToGoogle();

  Future signInWithEmailAndPassword({
    required String email,
    required String password,
  });

  Future createUserWithEmailAndPassword({
    required String email,
    required String password,
  });
}

/// An [AuthUser] with a permanent account.
abstract class RegisteredUser extends AuthUser {
  const RegisteredUser() : super();

  /// The names of the identity providers.
  List<String> get providers;

  /// Links this account to a Google account. If it fails because the Google
  /// account is already linked to another account, sign-in to that account.
  @override
  Future linkToGoogle();
}

/// Generic authentication exception.
class AuthException implements Exception {
  String code;

  AuthException({required this.code});
}

/// Contains code to use Google authentication.
///
/// The [clientId] is required on some platforms (such as iOS).
mixin GoogleAuthMixin {
  Future<GoogleSignInAuthentication?> getGoogleAuth({String? clientId}) async {
    // See https://firebase.google.com/docs/auth/flutter/federated-auth.
    var googleUser = await GoogleSignIn().signIn();
    return await googleUser?.authentication;
  }
}

/// Generic format exception for credentials.
class FormatException implements Exception {
  String code;

  FormatException({required this.code});
}
