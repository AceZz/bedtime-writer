import 'package:flutter/material.dart';

import 'sign_in.dart';

class SignInOrRegisterScreen extends StatefulWidget {
  final String redirect;
  final String signInText;

  SignInOrRegisterScreen({
    required this.redirect,
    required this.signInText,
    Key? key,
  }) : super(key: key);

  @override
  State<SignInOrRegisterScreen> createState() => _SignInOrRegisterScreenState();
}

class _SignInOrRegisterScreenState extends State<SignInOrRegisterScreen> {
  bool showRegisterPage = true;

  void toggleScreens() {
    setState(() {
      showRegisterPage = !showRegisterPage;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (showRegisterPage) {
      //return RegisterScreen(onTap: toggleScreens);
      //TODO: add RegisterScreen
      return Placeholder();
    } else {
      return SignInScreen(
        redirect: widget.redirect,
        signInText: widget.signInText,
        createAccountToggleOnTap: toggleScreens,
      );
    }
  }
}
