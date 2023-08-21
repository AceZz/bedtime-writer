import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../backend/index.dart';
import 'app_alert_dialog.dart';
import 'app_text_field.dart';

class FeedbackButton extends StatelessWidget {
  final String text;
  final String? uid;

  const FeedbackButton({Key? key, required this.text, this.uid})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final style = GoogleFonts.outfit(
      color: Theme.of(context).primaryTextTheme.bodySmall?.color!,
      fontWeight: FontWeight.normal,
      fontSize: 16.sp,
      decoration: TextDecoration.underline,
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30),
          child: GestureDetector(
            onTap: () => _showFeedbackAlertDialog(
              context: context,
            ),
            child: Text(
              text,
              style: style,
            ),
          ),
        ),
      ],
    );
  }
}

_showFeedbackAlertDialog({required BuildContext context}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      const title = 'Feedback';

      final controller = TextEditingController();

      final content = AppTextField(
        controller: controller,
        hintText: 'Let\'s hear from you',
        obscureText: false,
        maxLines: 5,
      );

      final actions = <Widget>[
        TextButton(
          onPressed: () => _feedbackOnPressed(
            context: context,
            feedbackText: controller.text,
          ),
          child: Text(
            'Send',
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

_feedbackOnPressed({
  required BuildContext context,
  required String feedbackText,
}) {
  final feedback =
      UserFeedback(text: feedbackText, datetime: DateTime.now().toUtc());
  collectUserFeedback(feedback); // Async is voluntarily not awaited
  context.pop();
  _showFeedbackConfirmationAlertDialog(context: context);
}

void _showFeedbackConfirmationAlertDialog({
  required BuildContext context,
}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      const title = 'Success';
      final content = Text(
        'We believe in crafting a unique story experience at Dreamy Tales. With your feedback, we\'re already one step closer.\n\nThank you for your contribution!',
        style: Theme.of(context).primaryTextTheme.bodySmall,
      );
      final actions = <Widget>[
        TextButton(
          onPressed: context.pop,
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
