import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../backend/index.dart';
import '../../widgets/index.dart';

class FeedbackScreen extends StatefulWidget {
  final String? feedbackContext;

  const FeedbackScreen({Key? key, required this.feedbackContext})
      : super(key: key);

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    Widget image = Image.asset(
      'assets/decoration/feedback_panda.png',
      height: 150,
    );

    final message = Text(
      textMessage(),
      style: Theme.of(context).primaryTextTheme.bodyMedium,
    );

    final textField = AppTextField(
      controller: controller,
      hintText: 'Let\'s hear from you',
      obscureText: false,
      maxLines: 5,
      scrollPadding: const EdgeInsets.only(bottom: 200),
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
        child: ListView(
          children: [
            image,
            const SizedBox(height: 50),
            message,
            const SizedBox(height: 50),
            textField,
            const SizedBox(height: 20),
            submit,
          ],
        ),
      ),
    );
  }

  String textMessage() {
    switch (widget.feedbackContext) {
      case 'firstStory':
        return 'Congrats on your first story! '
            'We\'d love to have your feedback.';
      default:
        return 'Thank you for using Dreamy Tales! '
            'Please share your feedback with us.';
    }
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
