import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/lottie_loading.dart';

class LoadingContent extends ConsumerWidget {
  const LoadingContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          LottieLoading(),
          Text(
            'Your story is being created...',
            style: Theme.of(context).primaryTextTheme.headlineSmall,
          ),
        ]);
  }
}
