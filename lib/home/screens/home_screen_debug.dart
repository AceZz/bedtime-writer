import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../backend/index.dart';

class HomeScreenDebugAuth extends ConsumerWidget {
  const HomeScreenDebugAuth({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final _button = button(user);

    List<Widget> children = [
      Text(user.toString()),
      if (_button != null) _button,
    ];

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children,
    );
  }

  Widget? button(User user) {
    if (user is UnauthUser) {
      return OutlinedButton(
        onPressed: () async {
          await user.signInAnonymously();
        },
        child: Text('Anonymous log in'),
      );
    }

    if (user is AuthUser) {
      return OutlinedButton(
        onPressed: () async {
          await user.signOut();
        },
        child: Text('Log out'),
      );
    }

    return null;
  }
}

class HomeScreenDebugStats extends ConsumerWidget {
  const HomeScreenDebugStats({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final preferences = ref.watch(preferencesProvider);

    AsyncValue<Stats> stats = ref.watch(statsProvider);

    Widget statsWidget = stats.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, stack) => Text('numStories error: $err'),
      data: (stats) => Text(
          'numStories: ${stats.numStories}\nremainingStories: ${stats.remainingStories}\nhasLoggedOut: ${preferences.hasLoggedOut}'),
    );

    List<Widget> children = [
      statsWidget,
      Text(user.toString()),
    ];

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children,
    );
  }
}
