import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const onPrimary = Colors.white;

var theme = ThemeData(
  colorScheme: ColorScheme(
    brightness: Brightness.dark,
    primary: const Color(0xFFE9AFA3),
    onPrimary: onPrimary,
    secondary: const Color(0xFFFF7B00),
    onSecondary: Colors.black,
    background: const Color(0xFF0B2545),
    onBackground: Colors.white,
    surface: const Color(0xFF0B2545),
    onSurface: Colors.white,
    error: const Color(0xFFB3261E),
    onError: Colors.white,
  ),
  primaryTextTheme: TextTheme(
    // Application name on the home screen
    headlineLarge: GoogleFonts.handlee(
      color: onPrimary,
      fontWeight: FontWeight.w400,
      fontSize: 90,
    ),
    // Page title (question, story title, etc.)
    headlineMedium: GoogleFonts.outfit(
      color: onPrimary,
      fontWeight: FontWeight.normal,
      fontSize: 40,
    ),
    // Screen-wide message (loading message)
    headlineSmall: GoogleFonts.outfit(
      color: onPrimary,
      fontWeight: FontWeight.normal,
      fontSize: 30,
    ),
    // Choice text
    titleMedium: GoogleFonts.outfit(
      color: onPrimary,
      fontWeight: FontWeight.normal,
      fontSize: 20,
    ),
    // Story text
    bodyMedium: GoogleFonts.outfit(
      color: onPrimary,
      fontWeight: FontWeight.normal,
      fontSize: 24,
    ),
    // Snack bar for debug
    bodySmall: GoogleFonts.outfit(
      color: onPrimary,
      fontWeight: FontWeight.normal,
      fontSize: 14,
    ),
  ),
);
