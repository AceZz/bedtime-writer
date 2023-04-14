import 'package:bedtime_writer/backend/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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

    return AppScaffold(
      appBarTitle: 'Account',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
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