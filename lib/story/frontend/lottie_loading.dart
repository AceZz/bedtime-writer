import 'dart:math';

String randomLottie() {
  // Get a list of the Lottie files in the specified folder
  final files = [
    'assets/lottie/dog.json',
    'assets/lottie/cat.json',
    'assets/lottie/dragon.json',
    'assets/lottie/sloth.json',
    'assets/lottie/pandas.json',
  ];

  // Select a random file
  final file = files[Random().nextInt(files.length)].toString();

  print(file);

  // Load the Lottie file
  return file;
}
