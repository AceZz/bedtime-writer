import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../states/create_story_state.dart';
import '../states/story_params.dart';

/// The maximum number of choices that can be displayed.
const maxNumChoices = 3;

/// Displays a [Choice]: [Choice.icon] on top of [Choice.text].
///
/// When clicking on this widget, the state is updated using the provided
/// [choice].
class _ChoiceButton extends ConsumerWidget {
  final Choice choice;

  const _ChoiceButton({Key? key, required this.choice}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // TODO: make it more responsive.
    var buttonWidth = 0.60 * MediaQuery.of(context).size.width;
    var buttonHeight = 0.15 * MediaQuery.of(context).size.height;

    var icon = Padding(
      padding: const EdgeInsets.all(10.0),
      child: Icon(
        choice.icon,
        size: 50,
      ),
    );
    var text = Text(
      choice.text,
      textAlign: TextAlign.center,
      style: Theme.of(context).primaryTextTheme.titleMedium,
    );

    return Padding(
      padding: EdgeInsetsDirectional.all(30),
      child: InkWell(
        onTap: () {
          ref.read(createStoryStateProvider.notifier).updateStoryParams(choice);
        },
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          width: buttonWidth,
          height: buttonHeight,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [icon, text],
          ),
        ),
      ),
    );
  }
}

class QuestionContent extends StatelessWidget {
  final Question question;

  const QuestionContent({
    Key? key,
    required this.question,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget questionText = Padding(
      padding: EdgeInsetsDirectional.all(20),
      child: Text(
        question.text,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineMedium,
      ),
    );

    List<Widget> choiceButtons = question.choices
        .take(maxNumChoices)
        .map((choice) => _ChoiceButton(choice: choice))
        .toList();

    return Column(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [questionText] + choiceButtons,
    );
  }
}
