import 'package:bedtime_writer/backend/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../widgets/index.dart';

/// Asks the user to sign in and redirects to [redirect].
class UserProfileScreen extends ConsumerWidget {
  final String redirect;
  final String signOutText;

  const UserProfileScreen({
    required this.redirect,
    required this.signOutText,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget text = Padding(
      padding: const EdgeInsets.all(20.0),
      child: Text(
        signOutText,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineSmall,
      ),
    );

    return AppScaffold(
      appBarTitle: 'Profile',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
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
    await _signOut();
  }

  context.pushReplacement(redirect);
}

Future<void> _signOut() async {
  try {
    await FirebaseAuth.instance.signOut();
  } catch (e) {
    print('Error signing out: $e');
  }
}