import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';

/// A widget that displays some text and is underlined (like a hypertext link).
/// It can execute an action on tap.
class AppTextButton extends StatelessWidget {
  final String text;
  final GestureTapCallback? onTap;

  const AppTextButton({
    Key? key,
    required this.text,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final style = GoogleFonts.outfit(
      color: Theme.of(context).primaryTextTheme.bodySmall?.color!,
      fontWeight: FontWeight.normal,
      fontSize: 16.sp,
      decoration: TextDecoration.underline,
    );

    return GestureDetector(
      onTap: onTap,
      child: Text(
        text,
        style: style,
      ),
    );
  }
}
