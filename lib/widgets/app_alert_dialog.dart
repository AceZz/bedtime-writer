import 'package:flutter/material.dart';

class AppAlertDialog extends StatelessWidget {
  final String title;
  final Widget content;
  final List<Widget> actions;

  const AppAlertDialog({
    Key? key,
    required this.title,
    required this.content,
    required this.actions,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final deviceWidth = MediaQuery.of(context).size.width;

    return AlertDialog(
      title: Text(
        title,
        style: Theme.of(context).primaryTextTheme.bodySmall,
      ),
      backgroundColor: Theme.of(context).colorScheme.background,
      content: SizedBox(width: 0.6 * deviceWidth, child: content),
      actions: actions,
    );
  }
}
