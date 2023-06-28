import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/app_scaffold.dart';

class ErrorScreen extends StatelessWidget {
  final String text;

  const ErrorScreen({
    Key? key,
    required this.text,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      showAppBar: false,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Padding(
            padding: EdgeInsets.symmetric(
                horizontal: 0.1 * MediaQuery.of(context).size.width),
            child: Text(
              this.text,
              textAlign: TextAlign.center,
              style: Theme.of(context).primaryTextTheme.bodyMedium,
            ),
          ),
          SizedBox(height: 20), // Add some space
          _ErrorScreenButton(text: 'Back to Home', destination: 'home')
        ],
      ),
    );
  }
}

class _ErrorScreenButton extends StatelessWidget {
  final String text;
  final String destination;

  const _ErrorScreenButton({
    Key? key,
    required this.text,
    required this.destination,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget buttonTextWidget = Text(
      text,
      style: Theme.of(context).primaryTextTheme.bodyMedium,
    );

    return Container(
      width: 0.8 * MediaQuery.of(context).size.width,
      height: 40,
      child: Material(
        color: Colors.grey.shade600,
        elevation: 10,
        borderRadius: BorderRadius.circular(10),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        child: InkWell(
          onTap: () {
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
