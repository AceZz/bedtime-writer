import 'package:flutter/cupertino.dart';

class AppBackgroundContainer extends StatelessWidget {
  const AppBackgroundContainer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF743C51), Color(0xFF0B2545)],
        ),
      ),
    );
  }
}
