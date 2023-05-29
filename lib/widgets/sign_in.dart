import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';

class GoogleSignInButton extends StatelessWidget {
  final String text;
  final void Function() onPressed;

  const GoogleSignInButton(
      {Key? key, required this.text, required this.onPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final logo = Image(
      image: AssetImage('assets/logos/google_light.png'),
      height: 42.sp,
    );

    final TextStyle textStyle = GoogleFonts.outfit(
      color: Colors.black87,
      fontWeight: FontWeight.normal,
      fontSize: 16.sp,
    );

    final Widget textWidget = Text(text, style: textStyle);

    return FilledButton.icon(
      onPressed: onPressed,
      icon: logo,
      label: textWidget,
      style: FilledButton.styleFrom(
        foregroundColor: Colors.black,
        backgroundColor: Colors.white,
      ),
    );
  }
}

class SignInScreenButton extends StatelessWidget {
  final String text;
  final Color color;
  final void Function() onTap;

  const SignInScreenButton({
    Key? key,
    required this.text,
    required this.onTap,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(5),
        ),
        child: Center(
          child: Text(
            text,
            style: Theme.of(context).primaryTextTheme.bodyMedium,
          ),
        ),
      ),
    );
  }
}
