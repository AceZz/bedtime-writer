import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../story/index.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreenButton extends ConsumerWidget {
  final String buttonText;
  final String destinationScreen;
  final bool resetStoryState;

  const HomeScreenButton({
    Key? key,
    required this.buttonText,
    required this.destinationScreen,
    this.resetStoryState = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget buttonTextWidget = Text(
      buttonText,
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
            context.pushNamed(destinationScreen);
          },
          child: Ink(
            child: Center(child: buttonTextWidget),
          ),
        ),
      ),
    );
  }
}
