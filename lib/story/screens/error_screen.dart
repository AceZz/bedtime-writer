import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/app_scaffold.dart';

class ErrorScreen extends StatelessWidget {
  final String text;
  final String buttonText;
  final String destination;
  final Color? buttonColor;

  const ErrorScreen({
    Key? key,
    required this.text,
    required this.buttonText,
    required this.destination,
    this.buttonColor,
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
          _ErrorScreenButton(
            text: this.buttonText,
            destination: this.destination,
            buttonColor: this.buttonColor,
          )
        ],
      ),
    );
  }
}

class _ErrorScreenButton extends StatelessWidget {
  final String text;
  final String destination;
  final Color? buttonColor;

  const _ErrorScreenButton({
    Key? key,
    required this.text,
    required this.destination,
    this.buttonColor,
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
        color: this.buttonColor ?? Colors.grey.shade600,
        elevation: 10,
        borderRadius: BorderRadius.circular(10),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        child: InkWell(
          onTap: () {
            context.pushReplacementNamed(
                'home'); // Allows users to go back to home with back in app bar in the destination screen.
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
