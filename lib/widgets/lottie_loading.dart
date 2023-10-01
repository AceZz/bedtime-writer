import 'dart:math';
import 'package:lottie/lottie.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

final _files = [
  'assets/lottie/dog.json',
  'assets/lottie/cat.json',
  'assets/lottie/dragon.json',
  'assets/lottie/sloth.json',
  'assets/lottie/pandas.json',
];

String _randomLottie() {
  // Return a random Lottie file
  return _files[Random().nextInt(_files.length)].toString();
}

class LottieLoading extends StatelessWidget {
  const LottieLoading({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Lottie.asset(
      _randomLottie(),
      width: 180.sp,
      height: 180.sp,
      fit: BoxFit.cover,
      animate: true,
    );
  }
}
