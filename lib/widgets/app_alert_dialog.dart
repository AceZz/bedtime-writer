import 'package:flutter/material.dart';

class AppAlertDialog extends StatelessWidget {
  final String titleText;
  final Widget content;
  final List<Widget> actions;

  const AppAlertDialog({
    Key? key,
    required this.titleText,
    required this.content,
    required this.actions,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    double deviceWidth = MediaQuery.of(context).size.width;

    return AlertDialog(
        title: Text(
          titleText,
          style: Theme.of(context).primaryTextTheme.bodySmall,
        ),
        backgroundColor: Theme.of(context).colorScheme.background,
        content: Container(width: 0.6 * deviceWidth, child: content),
        actions: actions);
  }
}
