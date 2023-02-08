import 'package:bedtime_writer/story/states/state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/fade_in.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget titleWidget = Padding(
      padding: const EdgeInsets.symmetric(vertical: 50.0),
      child: FadeIn(
        duration: Duration(milliseconds: 1500),
        delay: Duration(milliseconds: 500),
        child: Text(
          'Bedtime Stories',
          textAlign: TextAlign.center,
          style: Theme.of(context).primaryTextTheme.headlineLarge,
        ),
      ),
    );

    Widget newStoryButton = ElevatedButton(
      onPressed: () {
        ref.read(storyStateProvider.notifier).reset();
        context.push('/create_story');
      },
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Text(
          'New story',
          style: Theme.of(context).primaryTextTheme.headlineSmall,
        ),
      ),
    );

    Widget settingsButton = ElevatedButton(
      onPressed: () {
        context.push('/settings');
      },
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Text(
          'Settings',
          style: Theme.of(context).primaryTextTheme.headlineSmall,
        ),
      ),
    );

    Widget menuWidget = Padding(
      padding: const EdgeInsets.only(top: 50.0),
      child: Column(
        children: [newStoryButton, settingsButton]
            .asMap()
            .map(
              // The buttons will fade in one after the other
              (i, button) => MapEntry(
                  i,
                  FadeIn(
                    duration: Duration(milliseconds: 1500),
                    delay: Duration(milliseconds: 500 + 1000 * (i + 1)),
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

    return Scaffold(
        backgroundColor: Theme.of(context).colorScheme.background,
        body: SafeArea(
          child: Container(
            width: MediaQuery.of(context).size.width,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                titleWidget,
                menuWidget,
              ],
            ),
          ),
        ));
  }
}
