import 'dart:math';

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
