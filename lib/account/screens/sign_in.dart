import 'package:bedtime_writer/backend/index.dart';
import 'package:bedtime_writer/widgets/sign_in.dart';
import 'package:bedtime_writer/widgets/textField.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../backend/user.dart';
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
  String infoText = '';

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

    Widget textInfo = Text(
      infoText,
      textAlign: TextAlign.center,
      style: GoogleFonts.outfit(
        color: Colors.red,
        fontWeight: FontWeight.normal,
        fontSize: 16,
      ),
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
            SizedBox(height: 30),
            textInfo,
            SizedBox(height: 10),
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

//TODO: Refactor to make non Firebase dependent in this file
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
    throw Exception(
        'User is already signed in and should not be able to sign in with Google');
  }
  context.pushReplacement(redirect);
}

//TODO: move this inside Widget state to be able to set state for exceptions
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

  final user = ref.watch(userProvider);
  print(user);

  if (user is UnauthUser) {
    //TODO: Debug this, exception thrown is not caught
    try {
      print('coucou');
      await user.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      print('awaited');
    } on Exception catch (e) {
      print('error');
      context.pop();
      _showAlertDialog(context: context, e: e);
    }
  } else if (user is AnonymousUser) {
    try {
      await user.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on Exception catch (e) {
      context.pop();
      _showAlertDialog(context: context, e: e);
    }
  } else if (user is AuthUser) {
    throw Exception(
        'User is already signed-in and should be able to re sign in');
  }
  context.pushReplacement(redirect);
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

  final user = ref.watch(userProvider);
  print(user);

  if (user is UnauthUser) {
    try {
      await user.createUserWithEmailAndPassword(email: email, password: password);
      context.pushReplacement(redirect);
    } on Exception catch (e) {
      context.pop();
      _showAlertDialog(context: context, e: e);
    }
  } else if (user is AnonymousUser) {
    try {
      await user.createUserWithEmailAndPassword(email: email, password: password);
      context.pushReplacement(redirect);
    } on Exception catch (e) {
      context.pop();
      _showAlertDialog(context: context, e: e);
    }
    context.pushReplacement(redirect);
  } else if (user is AuthUser) {
    throw Exception('User is signed-in and should not see this screen');
  }
}

void _showAlertDialog({required BuildContext context, required Exception e}) {
  String? text;

  if (e is AuthException) {
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
