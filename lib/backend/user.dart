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
}

/// An authenticated [User].
abstract class AuthUser extends User {
  const AuthUser() : super();

  String get uid;

  Future linkToGoogle();

  Future signOut();
}

/// An [AuthUser] with an anonymous account.
abstract class AnonymousUser extends AuthUser {
  const AnonymousUser() : super();

  /// Links this account to a Google account. If it fails, keeps using the
  /// current account.
  Future linkToGoogle();
}

/// An [AuthUser] with a permanent account.
abstract class RegisteredUser extends AuthUser {
  const RegisteredUser() : super();

  /// The names of the identity providers.
  List<String> get providers;

  /// Links this account to a Google account. If it fails because the Google
  /// account is already linked to another account, sign-in to that account.
  Future linkToGoogle();
}

/// Generic authentication exception.
class AuthException implements Exception {}

/// Thrown when sign-in fails.
class InvalidCredentialException extends AuthException implements Exception {}

/// Thrown when another account is already linked with the authentication
/// provider's credential.
class CredentialAlreadyUsedException extends AuthException
    implements Exception {}

/// Contains code to use Google authentication.
mixin GoogleAuthMixin {
  Future<GoogleSignInAuthentication?> getGoogleAuth() async {
    // See https://firebase.google.com/docs/auth/flutter/federated-auth.
    final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
    return await googleUser?.authentication;
  }
}
