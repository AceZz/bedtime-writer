import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../backend/index.dart';
import '../../widgets/index.dart';

class FeedbackScreen extends ConsumerWidget {
  const FeedbackScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();

    Widget image = Image.asset(
      'assets/decoration/feedback_panda.png',
      height: 150,
    );

    final textField = AppTextField(
      controller: controller,
      hintText: 'Let\'s hear from you',
      obscureText: false,
      maxLines: 8,
    );

    final submit = TextButton(
      onPressed: () => _submit(
        feedbackText: controller.text,
        context: context,
      ),
      child: Text(
        'Send',
        style: Theme.of(context).primaryTextTheme.bodySmall,
      ),
    );

    return AppScaffold(
      showAppBar: true,
      showAccountButton: false,
      appBarTitle: 'Send feedback',
      child: Padding(
        padding: const EdgeInsets.all(40.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            image,
            const SizedBox(height: 50),
            textField,
            const SizedBox(height: 20),
            submit,
          ],
        ),
      ),
    );
  }
}

_submit({
  required String feedbackText,
  required BuildContext context,
}) {
  final feedback =
      UserFeedback(text: feedbackText, createdAt: DateTime.now().toUtc());
  collectUserFeedback(feedback); // Async is voluntarily not awaited
  _showFeedbackConfirmationAlertDialog(context: context);
}

void _showFeedbackConfirmationAlertDialog({
  required BuildContext context,
}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      const title = 'Feedback submitted!';
      final content = Text(
        'We believe in crafting a unique story experience at Dreamy Tales. With your feedback, we\'re already one step closer.\n\nThank you for your contribution!',
        style: Theme.of(context).primaryTextTheme.bodySmall,
      );
      final actions = <Widget>[
        TextButton(
          onPressed: () {
            // Close the dialog and close the feedback screen.
            context.pop();
            context.pop();
          },
          child: Text(
            'Keep dreaming',
            style: Theme.of(context).primaryTextTheme.bodySmall,
          ),
        ),
      ];

      return AppAlertDialog(
        title: title,
        content: content,
        actions: actions,
      );
    },
  );
}
