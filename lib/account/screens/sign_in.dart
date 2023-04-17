import 'package:bedtime_writer/backend/index.dart';
import 'package:bedtime_writer/widgets/sign_in.dart';
import 'package:bedtime_writer/widgets/textField.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../widgets/index.dart';

/// Asks the user to sign in and redirects to [redirect].
class SignInScreen extends ConsumerWidget {
  final String redirect;
  final String signInText;

  const SignInScreen({
    required this.redirect,
    required this.signInText,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget text = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(
        signInText,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineSmall,
      ),
    );

    Widget image = Image.asset(
      'decoration/feather.png',
      width: 240,
    );

    final usernameController = TextEditingController();
    final passwordController = TextEditingController();

    Widget userTextField = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: MyTextField(
        controller: usernameController,
        hintText: 'Username',
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
      child: SignInButton(text: 'Sign In', onTap: () => {}),
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
              onPressed: () => _onPressed(context, ref, redirect),
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
          userTextField,
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

void _onPressed(BuildContext context, WidgetRef ref, String redirect) async {
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
