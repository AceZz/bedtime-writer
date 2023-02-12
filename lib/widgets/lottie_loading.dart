import 'dart:math';
import 'package:lottie/lottie.dart';
import 'package:flutter/material.dart';

final files = [
  'assets/lottie/dog.json',
  'assets/lottie/cat.json',
  'assets/lottie/dragon.json',
  'assets/lottie/sloth.json',
  'assets/lottie/pandas.json',
];

String randomLottie() {
  // Return a random Lottie file
  return files[Random().nextInt(files.length)].toString();
}

class LottieLoadingWidget extends StatelessWidget {
  const LottieLoadingWidget({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Lottie.asset(
          randomLottie(),
          width: 180,
          height: 180,
          fit: BoxFit.cover,
          animate: true,
        ),
        Text(
          'Your story is being created...',
          style: Theme.of(context).primaryTextTheme.headlineSmall,
        ),
      ],
    );
  }
}
