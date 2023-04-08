import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config.dart';
import '../../story/index.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/fade_in.dart';
import 'home_screen_debug.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget titleWidget = Padding(
      padding: const EdgeInsets.only(top: 80, bottom: 20),
      child: FadeIn(
        duration: const Duration(milliseconds: 1500),
        delay: const Duration(milliseconds: 500),
        child: Text(
          'Dreamy Tales',
          textAlign: TextAlign.center,
          style: Theme.of(context).primaryTextTheme.headlineLarge,
        ),
      ),
    );

    Widget newStoryButton = _HomeScreenButton(
      text: 'New story',
      destination: 'create_story',
      resetStoryState: true,
    );

    Widget libraryButton =
        _HomeScreenButton(text: 'Library', destination: 'library');

    Widget preferencesButton =
        _HomeScreenButton(text: 'Preferences', destination: 'preferences');

    Widget menuWidget = Padding(
      padding: const EdgeInsets.only(top: 30),
      child: Column(
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
      ),
    );

    return AppScaffold(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Flexible(
            flex: 0,
            child: titleWidget,
          ),
          Flexible(
            flex: 0,
            child: menuWidget,
          ),
          if (debugAuth())
            Flexible(
              child: Row(
                children: [
                  Flexible(child: HomeScreenDebug()),
                ],
              ),
            ),
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

  const _HomeScreenButton({
    Key? key,
    required this.text,
    required this.destination,
    this.resetStoryState = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget buttonTextWidget = Text(
      text,
      style: Theme.of(context).primaryTextTheme.headlineSmall,
    );

    return Container(
      width: 0.7 * MediaQuery.of(context).size.width,
      height: 60,
      child: Material(
        color: Theme.of(context).colorScheme.primary,
        elevation: 10,
        borderRadius: BorderRadius.circular(10),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        child: InkWell(
          onTap: () {
            if (resetStoryState) {
              ref.read(createStoryStateProvider.notifier).reset();
            }
            context.pushNamed(destination);
          },
          child: Ink(
            child: Center(child: buttonTextWidget),
          ),
        ),
      ),
    );
  }
}
