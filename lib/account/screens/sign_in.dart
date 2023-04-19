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

  if (user is UnauthUser) {
    _signInWithEmailAndPassword(
        context: context, email: email, password: password, redirect: redirect);
  } else if (user is AnonymousUser) {
    //TODO: change with email sign in
    //TODO: understand when user is Unauth or Anonymous
  } else if (user is AuthUser) {
    //TODO: throw error
  }
}

void _signInWithEmailAndPassword({
  required BuildContext context,
  required String email,
  required String password,
  required String redirect,
}) async {
  try {
    await FirebaseAuth.instance
        .signInWithEmailAndPassword(email: email, password: password);
    context.pushReplacement(redirect);
  } on FirebaseAuthException catch (e) {
    context.pop();
    if (e.code == 'user-not-found') {
      _showAlertDialog(context: context, text: 'User does not exist');
    } else if (e.code == 'wrong-password') {
      _showAlertDialog(context: context, text: 'Incorrect password');
    } else if (e.code == 'invalid-email') {
      _showAlertDialog(context: context, text: 'The email format is not valid');
    }
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

  if (user is UnauthUser) {
    _createUserWithEmailAndPassword(
        context: context,
        ref: ref,
        email: email,
        password: password,
        redirect: redirect,
        link: false);
  } else if (user is AnonymousUser) {
    //TODO: change with email sign in
  } else if (user is AuthUser) {
    //TODO: throw error
  }
}

void _createUserWithEmailAndPassword({
  required BuildContext context,
  required WidgetRef ref,
  required String email,
  required String password,
  required String redirect,
  required bool link,
}) async {
  try {
    _validateEmail(email);
    _validatePassword(password);
    if (link) {
      /// Case where account should be linked
      // if (kIsWeb) {
      //   AuthCredential credential = firebase_auth.EmailAuthProvider.credential(
      //       email: email, password: password);
      //
      //   //TODO: Continue below for link case
      //   final user = ref.read(userProvider);
      //   AuthResult result = await user.linkWithCredential(credential);
      //   FirebaseUser linkedUser = result.user;
      //
      //   final provider = FirebaseAuth.GoogleAuthProvider();
      //   return firebaseAuth.signInWithPopup(provider);
      // }
      //
      // final credential = await _getGoogleCredential();
      //
      // try {
      //   return await user.linkWithCredential(credential);
      // } on firebase_auth.FirebaseAuthException catch (e) {
      //   if (_credentialAlreadyUsed(e)) {
      //     return firebaseAuth.signInWithCredential(credential);
      //   }
      //   throw e;
      // }
    } else {
      /// Case where account should be created
      await FirebaseAuth.instance
          .createUserWithEmailAndPassword(email: email, password: password);
    }
    context.pushReplacement(redirect);
  } on FirebaseAuthException catch (e) {
    print(e.code);
    context.pop();
    if (e.code == 'user-not-found') {
      _showAlertDialog(context: context, text: 'User does not exist');
    } else if (e.code == 'wrong-password') {
      _showAlertDialog(context: context, text: 'Incorrect password');
    } else if (e.code == 'invalid-email') {
      _showAlertDialog(context: context, text: 'The email format is not valid');
    } else if (e.code == 'internal-error') {
      _showAlertDialog(context: context, text: 'Internal error');
    } else if (e.code == 'weak-password') {
      _showAlertDialog(
          context: context, text: 'Please choose a stronger password');
    } else if (e.code == 'email-already-in-use') {
      _showAlertDialog(
          context: context, text: 'An account already exists with this email');
    }
  } on FormatException catch (e) {
    context.pop();
    if (e.code == 'invalid-email-format') {
      _showAlertDialog(context: context, text: 'The email format is not valid');
    } else if (e.code == 'invalid-password-format') {
      _showAlertDialog(
          context: context,
          text:
              'Choose a stronger password, with at least 8 characters, and at least one letter and one digit');
    }
  }
}

void _showAlertDialog({required BuildContext context, required String text}) {
  showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.grey.shade700,
          title: Text(
            text,
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
