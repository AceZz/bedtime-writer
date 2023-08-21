import 'package:flutter/cupertino.dart';

class AppBackgroundContainer extends StatelessWidget {
  final Widget child;
  const AppBackgroundContainer({Key? key, required this.child})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF392F4B), Color(0xFF0B2545)],
        ),
      ),
      child: child,
    );
  }
}
