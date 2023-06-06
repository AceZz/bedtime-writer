import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MyTextField extends StatelessWidget {
  final controller;
  final String hintText;
  final bool obscureText;

  const MyTextField({
    Key? key,
    required this.controller,
    required this.hintText,
    required this.obscureText,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    TextStyle inputTextStyle = GoogleFonts.outfit(
      color: Colors.black54,
      fontWeight: FontWeight.normal,
      fontSize: 16,
    );

    TextStyle hintStyle = GoogleFonts.outfit(
      color: Colors.grey.shade400,
      fontWeight: FontWeight.normal,
      fontSize: 16,
    );

    return TextField(
        controller: controller,
        obscureText: obscureText,
        style: inputTextStyle,
        decoration: InputDecoration(
          enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.grey.shade800)),
          focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(color: Colors.white),
          ),
          fillColor: Colors.grey.shade200,
          filled: true,
          hintText: hintText,
          hintStyle: hintStyle,
        ));
  }
}
