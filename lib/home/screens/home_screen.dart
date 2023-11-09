import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../backend/index.dart';
import '../../config.dart';
import '../../story/index.dart';
import '../../widgets/index.dart';
import 'home_screen_debug.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // After using `pushNamed`, `HomeScreen` is *still* built and displayed at
    // the bottom of the screens stack (cf. the behaviour of `Navigator`), even
    // though it is hidden by the other screens.
    // Without the `isTopScreen` check, the feedback redirect could thus be
    // triggered on other screens.
    final isTopScreen = ModalRoute.of(context)?.isCurrent ?? false;
    final alreadyAsked = ref.watch(
      preferencesProvider
          .select((preferences) => preferences.initialFeedbackAsked),
    );
    final numStories = ref.watch(userStatsProvider).value?.numStories ?? 0;

    if (isTopScreen && !alreadyAsked && numStories > 0) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(preferencesProvider.notifier).updateInitialFeedbackAsked(true);
        context.pushNamed(
          'feedback',
          pathParameters: {'context': 'firstStory'},
        );
      });
    }

    final fadeInGroup = FadeInGroup(delay: 500, duration: 1500);

    final title = fadeInGroup.add(
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: 0.2 * MediaQuery.of(context).size.width,
          ),
          child: Text(
            'Dreamy\nTales',
            textAlign: TextAlign.center,
            style: Theme.of(context).primaryTextTheme.headlineLarge,
          ),
        ),
      ),
    );

    return AppScaffold(
      showAppBar: false,
      showAccountButton: true,
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 60),
            title,
            const SizedBox(height: 20),
            fadeInGroup.add(child: const _DisplayRemainingStories()),
            const SizedBox(height: 20),
            _Menu(
              fadeInGroup: fadeInGroup,
              children: [
                const _HomeScreenButton(
                  text: 'New story',
                  destination: 'create_story',
                  resetStoryState: true,
                  dependsOnUserStats: true,
                ),
                const _HomeScreenButton(
                  text: 'Library',
                  destination: 'library',
                ),
                AppTextButton(
                  text: 'Send feedback',
                  onTap: () => context.pushNamed(
                    'feedback',
                    pathParameters: {'context': 'default'},
                  ),
                ),
                AppTextButton(
                  text: 'Privacy policy',
                  onTap: () => launchUrl(
                    Uri.parse('https://www.dreamy-tales.com/privacy'),
                  ),
                ),
              ],
            ),
            if (debugAuth())
              const _CustomCenterAtBottom(child: HomeScreenDebugAuth()),
            if (debugUserStats())
              const _CustomCenterAtBottom(child: HomeScreenDebugUserStats()),
            if (debugPreferences())
              const _CustomCenterAtBottom(child: HomeScreenDebugPreferences()),
          ],
        ),
      ),
    );
  }
}

class _DisplayRemainingStories extends ConsumerWidget {
  const _DisplayRemainingStories({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    AsyncValue<UserStats> stats = ref.watch(userStatsProvider);

    Widget displayWidget = stats.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, stack) => const CircularProgressIndicator(),
      data: (userStats) {
        return Text(
          'Daily stories: ${userStats.remainingStories}',
          textAlign: TextAlign.center,
          style: Theme.of(context).primaryTextTheme.bodyMedium,
        );
      },
    );

    return displayWidget;
  }
}

class _Menu extends StatelessWidget {
  final FadeInGroup fadeInGroup;
  final List<Widget> children;

  const _Menu({Key? key, required this.fadeInGroup, required this.children})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: children
          .map(
            (child) => fadeInGroup.add(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: child,
              ),
            ),
          )
          .toList(),
    );
  }
}

class _HomeScreenButton extends ConsumerWidget {
  final String text;
  final String destination;
  final bool resetStoryState;

  /// Whether the button depends on user stats to be clickable.
  final bool dependsOnUserStats;

  const _HomeScreenButton({
    Key? key,
    required this.text,
    required this.destination,
    this.resetStoryState = false,
    this.dependsOnUserStats = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget buttonTextWidget = Text(
      text,
      style: Theme.of(context).primaryTextTheme.headlineSmall,
    );

    // User stats are fetched from Firestore which can have some latency.
    // We handle this delay by showing a CircularProgressIndicator
    final userStats = ref.watch(userStatsProvider);
    final userStatsIsLoadingOrError =
        userStats is AsyncLoading || userStats is AsyncError;
    final waitingUserStats = dependsOnUserStats && userStatsIsLoadingOrError;

    return Container(
      constraints: const BoxConstraints(maxHeight: 60, maxWidth: 350),
      child: Material(
        color: Theme.of(context).colorScheme.primary,
        elevation: 10,
        borderRadius: BorderRadius.circular(10),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        child: InkWell(
          onTap: waitingUserStats
              ? null
              : () {
                  if (resetStoryState) {
                    // Resets story state while considering preferences
                    ref.read(createStoryStateProvider.notifier).reset();
                  }
                  context.pushNamed(destination);
                },
          child: Ink(
            child: Center(
              child: waitingUserStats
                  ? CircularProgressIndicator(
                      color: Theme.of(context).colorScheme.onSurface,
                    )
                  : buttonTextWidget,
            ),
          ),
        ),
      ),
    );
  }
}

class _CustomCenterAtBottom extends StatelessWidget {
  final Widget child;

  const _CustomCenterAtBottom({Key? key, required this.child})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 30),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [Flexible(child: child)],
        ),
      ),
    );
  }
}
