import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../backend/index.dart';
import '../../config.dart';
import '../../story/index.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/fade_in.dart';
import 'home_screen_debug.dart';

//TODO: add number of stories remaining
//TODO: prevent limit reset on logout

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget titleWidget = FadeIn(
      duration: const Duration(milliseconds: 1500),
      delay: const Duration(milliseconds: 500),
      child: Padding(
        padding: EdgeInsets.symmetric(
            horizontal: 0.2 * MediaQuery.of(context).size.width),
        child: Text(
          'Dreamy\nTales',
          textAlign: TextAlign.center,
          style: Theme.of(context).primaryTextTheme.headlineLarge,
        ),
      ),
    );

    Widget newStoryButton = _HomeScreenButton(
      text: 'New story',
      destination: 'create_story',
      resetStoryState: true,
      waitStats: true,
    );

    Widget libraryButton =
        _HomeScreenButton(text: 'Library', destination: 'library');

    Widget preferencesButton =
        _HomeScreenButton(text: 'Preferences', destination: 'preferences');

    Widget menuWidget = Column(
      children: [newStoryButton, libraryButton, preferencesButton]
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
                )),
          )
          .values
          .toList(),
    );

    return AppScaffold(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(height: 60),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: titleWidget,
          ),
          SizedBox(height: 20),
          menuWidget,
          if (debugAuth())
            const _CustomCenterAtBottom(child: const HomeScreenDebugAuth()),
          if (debugStats())
            const _CustomCenterAtBottom(child: const HomeScreenDebugStats()),
        ],
      ),
      showAppBar: false,
      showAccountButton: true,
    );
  }
}

class _HomeScreenButton extends ConsumerWidget {
  final String text;
  final String destination;
  final bool resetStoryState;
  final bool waitStats;

  const _HomeScreenButton({
    Key? key,
    required this.text,
    required this.destination,
    this.resetStoryState = false,
    this.waitStats = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget buttonTextWidget = Text(
      text,
      style: Theme.of(context).primaryTextTheme.headlineSmall,
    );

    final stats = ref.watch(statsProvider);
    final statsIsLoadingOrError = stats is AsyncLoading || stats is AsyncError;
    final waitingStats = this.waitStats & statsIsLoadingOrError;

    return Container(
      width: 0.7 * MediaQuery.of(context).size.width,
      height: 60,
      child: Material(
        color: Theme.of(context).colorScheme.primary,
        elevation: 10,
        borderRadius: BorderRadius.circular(10),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        child: InkWell(
          onTap: waitingStats
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
                child: waitingStats
                    ? CircularProgressIndicator(
                        color: Theme.of(context).colorScheme.onSurface,
                      )
                    : buttonTextWidget),
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
    return Expanded(
      child: Align(
        alignment: Alignment.bottomCenter,
        child: Padding(
          padding: EdgeInsets.only(bottom: 30),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [Flexible(child: child)],
          ),
        ),
      ),
    );
  }
}
