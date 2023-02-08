import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';

import '../frontend//lottie_loading.dart';

class LoadingContent extends ConsumerWidget {
  const LoadingContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // select a random lottie for loading
    String lottiePath = randomLottie();

    return Column(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Lottie.asset(
          lottiePath,
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
