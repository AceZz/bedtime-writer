import 'package:bedtime_writer/backend/index.dart';
import 'package:bedtime_writer/widgets/sign_in.dart';
import 'package:bedtime_writer/widgets/textField.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../widgets/index.dart';

/// Asks the user to sign in and redirects to [redirect].

class SignInScreen extends ConsumerStatefulWidget {
  final String redirect;
  final String signInText;

  SignInScreen({
    required this.redirect,
    required this.signInText,
    Key? key,
  }) : super(key: key);

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  @override
  void initState() {
    super.initState();
  }

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    Widget text = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(
        widget.signInText,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineSmall,
      ),
    );

    Widget image = Image.asset(
      'assets/decoration/feather.png',
      width: 240,
    );

    Widget emailTextField = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: MyTextField(
        controller: emailController,
        hintText: 'Email',
        obscureText: false,
      ),
    );

    Widget passwordTextField = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: MyTextField(
        controller: passwordController,
        hintText: 'Password',
        obscureText: true,
      ),
    );

    TextStyle forgotPasswordTextStyle = GoogleFonts.outfit(
      color: Theme.of(context).textTheme.bodySmall?.color!,
      fontWeight: FontWeight.normal,
      fontSize: 14,
    );

    Widget forgotPasswordText = Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Text(
              'Forgot Password?',
              style: forgotPasswordTextStyle,
            )),
      ],
    );

    Widget signInButton = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: SignInScreenButton(
          text: 'Sign In',
          color: Theme.of(context).colorScheme.primary,
          onTap: () => _signInOnTap(
              context: context,
              ref: ref,
              email: emailController.text,
              password: passwordController.text,
              redirect: widget.redirect)),
    );

    Widget createAccountButton = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: SignInScreenButton(
          text: 'Create account',
          color: Colors.grey.shade500,
          onTap: () => _createAccountOnTap(
              context: context,
              ref: ref,
              email: emailController.text,
              password: passwordController.text,
              redirect: widget.redirect)),
    );

    Widget divider = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Row(
        children: [
          Expanded(
            child: Container(
              child: Divider(
                thickness: 0.5,
                color: Theme.of(context).colorScheme.onBackground,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text('or continue with',
                style: Theme.of(context).primaryTextTheme.bodySmall),
          ),
          Expanded(
            child: Container(
              child: Divider(
                thickness: 0.5,
                color: Theme.of(context).colorScheme.onBackground,
              ),
            ),
          )
        ],
      ),
    );

    Widget googleSignInButton = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: GoogleSignInButton(
              text: 'Google Sign in',
              onPressed: () => _googleOnPressed(
                  context: context, ref: ref, redirect: widget.redirect),
            ),
          ),
        ],
      ),
    );

    return AppScaffold(
      appBarTitle: 'Sign in',
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            SizedBox(height: 40),
            image,
            SizedBox(height: 20),
            text,
            SizedBox(height: 40),
            emailTextField,
            SizedBox(height: 10),
            passwordTextField,
            SizedBox(height: 5),
            forgotPasswordText,
            SizedBox(height: 20),
            signInButton,
            SizedBox(height: 10),
            createAccountButton,
            SizedBox(height: 20),
            divider,
            SizedBox(height: 20),
            googleSignInButton,
          ],
        ),
      ),
    );
  }
}

void _googleOnPressed(
    {required BuildContext context,
    required WidgetRef ref,
    required String redirect}) async {
  showDialog(
      context: context,
      builder: (context) {
        return Center(
          child: CircularProgressIndicator(),
        );
      });

  final user = ref.read(userProvider);

  if (user is UnauthUser) {
    await user.signInWithGoogle();
  } else if (user is AnonymousUser) {
    await user.linkToGoogle();
  } else if (user is AuthUser) {
    await user.linkToGoogle();
  }
  context.pushReplacement(redirect);
}

void _signInOnTap(
    {required BuildContext context,
    required WidgetRef ref,
    required String email,
    required String password,
    required String redirect}) async {
  showDialog(
      context: context,
      builder: (context) {
        return Center(
          child: CircularProgressIndicator(),
        );
      });

  final user = ref.read(userProvider);
  print(user);

  if (user is UnauthUser) {
    _signInWithEmailAndPassword(
        context: context, email: email, password: password, redirect: redirect);
  } else if (user is AnonymousUser) {
    _signInWithEmailAndPassword(
        context: context, email: email, password: password, redirect: redirect);
  } else if (user is AuthUser) {
    throw Exception('User is signed-in and should not see this screen');
  }
}

void _signInWithEmailAndPassword({
  required BuildContext context,
  required String email,
  required String password,
  required String redirect,
}) async {
  try {
    _validateNonEmptyPassword(password);
    await FirebaseAuth.instance
        .signInWithEmailAndPassword(email: email, password: password);
    context.pushReplacement(redirect);
  } on Exception catch (e) {
    context.pop();
    _showAlertDialog(context: context, e: e);
  }
}

void _createAccountOnTap({
  required BuildContext context,
  required WidgetRef ref,
  required String email,
  required String password,
  required String redirect,
}) async {
  showDialog(
      context: context,
      builder: (context) {
        return Center(
          child: CircularProgressIndicator(),
        );
      });

  final user = ref.read(userProvider);
  print(user);

  if (user is UnauthUser) {
    _createUserWithEmailAndPassword(
        context: context,
        ref: ref,
        email: email,
        password: password,
        redirect: redirect,
        link: false);
  } else if (user is AnonymousUser) {
    _createUserWithEmailAndPassword(
        context: context,
        ref: ref,
        email: email,
        password: password,
        redirect: redirect,
        link: true);
  } else if (user is AuthUser) {
    throw Exception('User is signed-in and should not see this screen');
  }
}

Future _createUserWithEmailAndPassword({
  required BuildContext context,
  required WidgetRef ref,
  required String email,
  required String password,
  required String redirect,
  required bool link,
}) async {
  try {
    _validateEmail(email);
    _validateNonEmptyPassword(password);
    _validatePassword(password);
    if (link) {
      /// Case where account should be linked
      if (kIsWeb) {
        return await FirebaseAuth.instance
            .createUserWithEmailAndPassword(email: email, password: password);
      }

      AuthCredential credential = firebase_auth.EmailAuthProvider.credential(
          email: email, password: password);

      return await FirebaseAuth.instance.currentUser
          ?.linkWithCredential(credential);
    } else {
      /// Case where account should be created
      await FirebaseAuth.instance
          .createUserWithEmailAndPassword(email: email, password: password);
    }
    context.pushReplacement(redirect);
  } on Exception catch (e) {
    context.pop();
    _showAlertDialog(context: context, e: e);
  }
}

void _showAlertDialog({required BuildContext context, required Exception e}) {
  String? text;

  if (e is FirebaseAuthException) {
    switch (e.code) {
      case 'user-not-found':
        text = 'The user does not exist. Please create an account.';
        break;
      case 'wrong-password':
        text = 'Incorrect password';
        break;
      case 'invalid-email':
        text = 'The email format is not valid';
        break;
      case 'network-request-failed':
        text = 'Network request failed';
        break;
      case 'internal-error':
        text = 'Internal error';
        break;
      case 'weak-password':
        text = 'Please choose a stronger password';
        break;
      case 'email-already-in-use':
        text = 'An account already exists with this email. Please sign in.';
        break;
      case 'credential-already-in-use':
        text = 'Account already exists. Please sign in.';
        break;
    }
  } else if (e is FormatException) {
    switch (e.code) {
      case 'invalid-email-format':
        text = 'The email format is not valid';
        break;
      case 'invalid-password-format':
        text =
            'Passwords must be at least 8 characters, with one letter and one digit';
        break;
      case 'empty-password':
        text = 'Please enter a password';
        break;
    }
  }

  showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.grey.shade700,
          title: Text(
            text ?? 'An unknown error occurred',
            style: Theme.of(context).primaryTextTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        );
      });
}

class FormatException implements Exception {
  String code;
  FormatException({required this.code});
}

void _validateEmail(String email) {
  // Email validation regular expression
  final RegExp emailRegex = RegExp(r'^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+');

  if (!emailRegex.hasMatch(email)) {
    throw FormatException(code: 'invalid-email-format');
  }
}

void _validatePassword(String password) {
  // Password validation regular expression: 8 characters, letters and digits
  final RegExp passwordRegex =
      RegExp(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$');

  if (!passwordRegex.hasMatch(password)) {
    throw FormatException(code: 'invalid-password-format');
  }
}

void _validateNonEmptyPassword(String? password) {
  // Password validation regular expression: 8 characters, letters and digits
  if (password == null || password == '') {
    throw FormatException(code: 'empty-password');
  }
}
