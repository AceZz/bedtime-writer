import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

var _uri = Uri.parse('https://www.dreamy-tales.com/privacy');

class PrivacyPolicy extends StatelessWidget {
  const PrivacyPolicy({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final style = GoogleFonts.outfit(
      color: Theme.of(context).primaryTextTheme.bodySmall?.color!,
      fontWeight: FontWeight.normal,
      fontSize: 16.sp,
      decoration: TextDecoration.underline,
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30),
          child: GestureDetector(
            onTap: () => launchUrl(_uri),
            child: Text(
              'Privacy policy',
              style: style,
            ),
          ),
        ),
      ],
    );
  }
}
