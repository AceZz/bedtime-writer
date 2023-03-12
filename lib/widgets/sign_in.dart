import 'package:flutter/material.dart';

class GoogleSignInButton extends StatelessWidget {
  final String text;
  final void Function() onPressed;

  const GoogleSignInButton(
      {Key? key, required this.text, required this.onPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final logo = Image(
      image: AssetImage('assets/logos/google_light.png'),
      height: 36.0,
    );

    return FilledButton.icon(
      onPressed: onPressed,
      icon: logo,
      label: Text(text),
      style: FilledButton.styleFrom(
        foregroundColor: Colors.black,
        backgroundColor: Colors.white,
      ),
    );
  }
}
