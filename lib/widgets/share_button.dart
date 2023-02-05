import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

Future<void> _onShare(BuildContext context, String text) async {
  final box = context.findRenderObject() as RenderBox?;
  await Share.share(
    text,
    sharePositionOrigin: box!.localToGlobal(Offset.zero) & box.size,
  );
}

/// A share button.
class ShareButton extends StatelessWidget {
  final String text;

  const ShareButton({Key? key, required this.text}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (context) => ElevatedButton(
        onPressed: () => _onShare(context, text),
        child: const Text('Share'),
      ),
    );
  }
}
