import 'package:bedtime_writer/widgets/home_screen_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/app_scaffold.dart';
import '../../widgets/fade_in.dart';

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
      buttonText: 'New story',
      destinationScreen: 'create_story',
      resetStoryState: true,
    );

    Widget libraryButton =
        HomeScreenButton(buttonText: 'Library', destinationScreen: 'library');

    Widget settingsButton =
        HomeScreenButton(buttonText: 'Settings', destinationScreen: 'settings');

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
