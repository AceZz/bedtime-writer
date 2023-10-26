import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../backend/index.dart';

class HomeScreenDebugAuth extends ConsumerWidget {
  const HomeScreenDebugAuth({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final buttonWidget = button(user);

    List<Widget> children = [
      Text(user.toString()),
      if (buttonWidget != null) buttonWidget,
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
        child: const Text('Anonymous log in'),
      );
    }

    if (user is AuthUser) {
      return OutlinedButton(
        onPressed: () async {
          await user.signOut();
        },
        child: const Text('Log out'),
      );
    }

    return null;
  }
}

class HomeScreenDebugUserStats extends ConsumerWidget {
  const HomeScreenDebugUserStats({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final preferences = ref.watch(preferencesProvider);

    AsyncValue<UserStats> userStats = ref.watch(userStatsProvider);

    Widget userStatsWidget = userStats.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, stack) => Text('numStories error: $err'),
      data: (userStats_) => Text(
        'numStories: ${userStats_.numStories}\nremainingStories: ${userStats_.remainingStories}\nhasLoggedOut: ${preferences.hasLoggedOut}',
      ),
    );

    List<Widget> children = [
      userStatsWidget,
      Text(user.toString()),
    ];

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children,
    );
  }
}

class HomeScreenDebugPreferences extends ConsumerWidget {
  const HomeScreenDebugPreferences({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'initialFeedbackAsked: '
          '${ref.watch(preferencesProvider).initialFeedbackAsked}',
        ),
        OutlinedButton(
          onPressed: () async {
            await ref
                .read(preferencesProvider.notifier)
                .updateInitialFeedbackAsked(false);
          },
          child: const Text('Reset initial feedback'),
        )
      ],
    );
  }
}
