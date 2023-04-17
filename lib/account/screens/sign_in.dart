import 'package:bedtime_writer/backend/index.dart';
import 'package:bedtime_writer/widgets/sign_in.dart';
import 'package:bedtime_writer/widgets/textField.dart';
import 'package:firebase_auth/firebase_auth.dart';
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
      'decoration/feather.png',
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

    TextStyle smallTextStyle = GoogleFonts.outfit(
      color: Theme.of(context).textTheme.bodySmall?.color!,
      fontWeight: FontWeight.normal,
      fontSize: 12,
    );

    Widget forgotPasswordText = Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Text(
              'Forgot Password?',
              style: smallTextStyle,
            )),
      ],
    );

    Widget signInButton = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: SignInButton(
          text: 'Sign In',
          onTap: () => _emailOnTap(
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
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          SizedBox(height: 50),
          image,
          SizedBox(height: 20),
          text,
          SizedBox(height: 50),
          emailTextField,
          SizedBox(height: 10),
          passwordTextField,
          SizedBox(height: 5),
          forgotPasswordText,
          SizedBox(height: 20),
          signInButton,
          SizedBox(height: 20),
          divider,
          SizedBox(height: 20),
          googleSignInButton,
        ],
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

void _emailOnTap(
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
    try {
      await FirebaseAuth.instance
          .signInWithEmailAndPassword(email: email, password: password);
      context.pushReplacement(redirect);
    } on FirebaseAuthException catch (e) {
      print(e.code);
      context.pop();
      if (e.code == 'user-not-found') {
        _showAlertDialog(context: context, text:'User does not exist');
      } else if (e.code == 'wrong-password') {
        _showAlertDialog(context: context, text:'Incorrect password');
      } else if (e.code == 'invalid-email') {
        _showAlertDialog(context: context, text:'The email format is not valid');
      }
    }
  } else if (user is AnonymousUser) {
    //TODO: change with email sign in
  } else if (user is AuthUser) {
    //TODO: throw error
  }
}

void _showAlertDialog({required BuildContext context, required String text}) {
  showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(text),
        );
      });
}
