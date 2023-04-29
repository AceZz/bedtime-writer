import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../backend/index.dart';
import '../../widgets/index.dart';

/// Asks the user to sign in and redirects to [redirect].
class UserAccountScreen extends ConsumerWidget {
  final String redirect;

  const UserAccountScreen({
    required this.redirect,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    String? displayName;
    if (user is AuthUser) {
      displayName = user.displayName;
    }

    String logInText = 'You\'re logged in';
    if (displayName != null) {
      logInText = 'You\'re logged in as $displayName';
    }

    final Widget text = Padding(
      padding: const EdgeInsets.all(20.0),
      child: Text(
        logInText,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineSmall,
      ),
    );

    final Widget icon = Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Icon(
        Icons.account_circle,
        size: 60,
        color: Theme.of(context).primaryTextTheme.bodyMedium?.color,
      ),
    );

    return AppScaffold(
      appBarTitle: 'Account',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          icon,
          text,
          SignOutButton(
            text: 'Sign out',
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
    throw Exception('User should be signed in to see this sign out button');
  } else if (user is AnonymousUser) {
    throw Exception('User should be signed in to see this sign out button');
  } else if (user is AuthUser) {
    await user.signOut();
  }

  context.pushReplacement(redirect);
}
