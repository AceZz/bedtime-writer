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
    Widget titleWidget = FadeIn(
      duration: const Duration(milliseconds: 1500),
      delay: const Duration(milliseconds: 500),
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
    );

    Widget newStoryButton = const _HomeScreenButton(
      text: 'New story',
      destination: 'create_story',
      resetStoryState: true,
      dependsOnUserStats: true,
    );

    Widget libraryButton =
        const _HomeScreenButton(text: 'Library', destination: 'library');

    var privacyPolicy = AppTextButton(
      text: 'Privacy policy',
      onTap: () => launchUrl(Uri.parse('https://www.dreamy-tales.com/privacy')),
    );
    const feedbackButton = FeedbackButton(text: 'Send feedback');

    Widget menuWidget = Column(
      children: [newStoryButton, libraryButton, feedbackButton, privacyPolicy]
          .asMap()
          .map(
            // The buttons will fade in one after the other
            (i, button) => MapEntry(
              i,
              FadeIn(
                duration: const Duration(milliseconds: 500),
                delay: Duration(milliseconds: 500 + 500 * (i + 1)),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: button,
                ),
              ),
            ),
          )
          .values
          .toList(),
    );

    return AppScaffold(
      showAppBar: false,
      showAccountButton: true,
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 60),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: titleWidget,
            ),
            const SizedBox(height: 20),
            const _DisplayRemainingStories(),
            const SizedBox(height: 20),
            menuWidget,
            if (debugAuth())
              const _CustomCenterAtBottom(child: HomeScreenDebugAuth()),
            if (debugUserStats())
              const _CustomCenterAtBottom(child: HomeScreenDebugUserStats()),
          ],
        ),
      ),
    );
  }
}

class _HomeScreenButton extends ConsumerWidget {
  final String text;
  final String destination;
  final bool resetStoryState;
  final bool
      dependsOnUserStats; //Indicates if the button depends on user stats to be clickable.

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

    // User stats are fetched from Firestore which can have some latency. We handle this delay by showing a CircularProgressIndicator
    final userStats = ref.watch(userStatsProvider);
    final userStatsIsLoadingOrError =
        userStats is AsyncLoading || userStats is AsyncError;
    final waitingUserStats = dependsOnUserStats && userStatsIsLoadingOrError;

    return SizedBox(
      width: 0.7 * MediaQuery.of(context).size.width,
      height: 60,
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

class _DisplayRemainingStories extends ConsumerWidget {
  const _DisplayRemainingStories({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    AsyncValue<UserStats> stats = ref.watch(userStatsProvider);

    Widget displayWidget = stats.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, stack) => const CircularProgressIndicator(),
      data: (userStats) {
        return FadeIn(
          duration: const Duration(milliseconds: 1500),
          delay: const Duration(milliseconds: 500),
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 0.2 * MediaQuery.of(context).size.width,
            ),
            child: Text(
              'Daily stories: ${userStats.remainingStories}',
              textAlign: TextAlign.center,
              style: Theme.of(context).primaryTextTheme.bodyMedium,
            ),
          ),
        );
      },
    );

    return displayWidget;
  }
}
