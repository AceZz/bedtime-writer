import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../backend/index.dart';

/// A floating account button, that displays a sign-in button if the user is not
/// signed in.
class FloatingAccountButton extends ConsumerWidget {
  const FloatingAccountButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final Widget button =
        user is RegisteredUser ? const _AccountButton() : const _SignInButton();

    return Padding(
      padding: const EdgeInsets.only(
        top: 20,
        right: 10,
      ),
      child: button,
    );
  }
}

class _SignInButton extends StatelessWidget {
  const _SignInButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: () {
        context.pushNamed('sign_in');
      },
      label: Text(
        'Sign in',
        style: Theme.of(context).primaryTextTheme.bodyMedium,
      ),
      backgroundColor: Theme.of(context).colorScheme.primary,
    );
  }
}

class _AccountButton extends StatelessWidget {
  const _AccountButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconButton(
      iconSize: 40,
      icon: Icon(
        Icons.account_circle,
        color: Theme.of(context).primaryTextTheme.bodyMedium?.color,
      ),
      onPressed: () {
        context.pushNamed('account');
      },
    );
  }
}
