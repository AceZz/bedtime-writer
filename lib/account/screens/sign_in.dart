import 'package:bedtime_writer/backend/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
      padding: const EdgeInsets.all(20.0),
      child: Text(
        signInText,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineSmall,
      ),
    );

    return AppScaffold(
      appBarTitle: 'Sign in',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          text,
          GoogleSignInButton(
            text: 'Sign in with Google',
            onPressed: () => _onPressed(context, ref, redirect),
          )
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
