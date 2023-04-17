import 'package:flutter/material.dart';

class SignOutButton extends StatelessWidget {
  final String text;
  final void Function() onPressed;

  const SignOutButton({Key? key, required this.text, required this.onPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: onPressed,
      child: Text(text),
      style: FilledButton.styleFrom(
        foregroundColor: Colors.black,
        backgroundColor: Colors.white,
      ),
    );
  }
}
