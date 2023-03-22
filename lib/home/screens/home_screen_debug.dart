import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../backend/index.dart';

class HomeScreenDebug extends ConsumerWidget {
  const HomeScreenDebug({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final _button = button(user);

    List<Widget> children = [
      Text(user.toString()),
      if (_button != null) _button,
    ];

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children,
    );
  }

  Widget? button(User user) {
    if (user is UnauthUser) {
      return OutlinedButton(
        onPressed: () async {
          await user.signInAnonymously();
        },
        child: Text('Anonymous log in'),
      );
    }

    if (user is AuthUser) {
      return OutlinedButton(
        onPressed: () async {
          await user.signOut();
        },
        child: Text('Log out'),
      );
    }

    return null;
  }
}
