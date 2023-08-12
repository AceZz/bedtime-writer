import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final bool obscureText;
  final int maxLines;

  const AppTextField({
    Key? key,
    required this.controller,
    required this.hintText,
    required this.obscureText,
    this.maxLines = 1,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final TextStyle inputTextStyle = GoogleFonts.outfit(
      color: Colors.black54,
      fontWeight: FontWeight.normal,
      fontSize: 16.sp,
    );

    final TextStyle hintStyle = GoogleFonts.outfit(
      color: Colors.grey.shade400,
      fontWeight: FontWeight.normal,
      fontSize: 16.sp,
    );

    return TextField(
      controller: controller,
      obscureText: obscureText,
      style: inputTextStyle,
      decoration: InputDecoration(
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.grey.shade800),
        ),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: Colors.white),
        ),
        fillColor: Colors.grey.shade200,
        filled: true,
        hintText: hintText,
        hintStyle: hintStyle,
      ),
      maxLines: maxLines,
    );
  }
}
