import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

const onPrimary = Colors.white;

class AppTheme {
  final BuildContext context;

  AppTheme(this.context);

  ThemeData get theme {
    return ThemeData(
      colorScheme: const ColorScheme(
        brightness: Brightness.dark,
        primary: Color(0xFFA54657),
        onPrimary: onPrimary,
        secondary: Color(0xFFFF7B00),
        onSecondary: Colors.black,
        background: Color(0xFF0B2545),
        onBackground: Colors.white,
        surface: Color(0xFF0B2545),
        onSurface: Colors.white,
        error: Color(0xFFB3261E),
        onError: Colors.white,
      ),
      primaryTextTheme: TextTheme(
        // Application name on the home screen
        headlineLarge: GoogleFonts.handlee(
          color: onPrimary,
          fontWeight: FontWeight.w400,
          fontSize: 94.sp,
        ),
        // Page title (question, story title, etc.)
        headlineMedium: GoogleFonts.outfit(
          color: onPrimary,
          fontWeight: FontWeight.normal,
          fontSize: 40.sp,
        ),
        // Screen-wide message (loading message)
        headlineSmall: GoogleFonts.outfit(
          color: onPrimary,
          fontWeight: FontWeight.normal,
          fontSize: 30.sp,
        ),
        // Choice text
        titleMedium: GoogleFonts.outfit(
          color: onPrimary,
          fontWeight: FontWeight.normal,
          fontSize: 22.sp,
        ),
        // Library tiles title
        titleSmall: GoogleFonts.outfit(
          color: onPrimary,
          fontWeight: FontWeight.normal,
          fontSize: 18.sp,
        ),
        // Loading text
        bodyLarge: GoogleFonts.outfit(
          color: onPrimary,
          fontWeight: FontWeight.normal,
          fontSize: 24.sp,
          letterSpacing: 1.2,
        ),
        // Story, preferences text
        bodyMedium: GoogleFonts.outfit(
          color: onPrimary,
          fontWeight: FontWeight.normal,
          fontSize: 20.sp,
          letterSpacing: 1.2,
        ),
        // Snack bar for debug
        bodySmall: GoogleFonts.outfit(
          color: onPrimary,
          fontWeight: FontWeight.normal,
          fontSize: 16.sp,
        ),
      ),
    );
  }
}
