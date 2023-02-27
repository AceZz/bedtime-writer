import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/app_scaffold.dart';
import '../../widgets/fade_in.dart';
import '../../story/index.dart';

class HomeScreenButton extends ConsumerWidget {
  final String text;
  final String destination;
  final bool resetStoryState;

  const HomeScreenButton({
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

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget titleWidget = Padding(
      padding: const EdgeInsets.symmetric(vertical: 50.0),
      child: FadeIn(
        duration: const Duration(milliseconds: 1500),
        delay: const Duration(milliseconds: 500),
        child: Text(
          'Bedtime Stories',
          textAlign: TextAlign.center,
          style: Theme.of(context).primaryTextTheme.headlineLarge,
        ),
      ),
    );

    Widget newStoryButton = HomeScreenButton(
      text: 'New story',
      destination: 'create_story',
      resetStoryState: true,
    );

    Widget libraryButton =
        HomeScreenButton(text: 'Library', destination: 'library');

    Widget settingsButton =
        HomeScreenButton(text: 'Settings', destination: 'settings');

    Widget menuWidget = Padding(
      padding: const EdgeInsets.only(top: 50.0),
      child: Column(
        children: [newStoryButton, libraryButton, settingsButton]
            .asMap()
            .map(
              // The buttons will fade in one after the other
              (i, button) => MapEntry(
                  i,
                  FadeIn(
                    duration: const Duration(milliseconds: 500),
                    delay: Duration(milliseconds: 500 + 500 * (i + 1)),
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 35.0),
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
          titleWidget,
          menuWidget,
        ],
      ),
      showAppBar: false,
    );
  }
}
