import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF3B5BDB);
  static const Color primaryDark = Color(0xFF2F4AC4);
  static const Color primaryLight = Color(0xFF748FFC);
  static const Color accent = Color(0xFF4DABF7);
  static const Color success = Color(0xFF2F9E44);
  static const Color error = Color(0xFFE03131);
  static const Color surface = Color(0xFFF8F9FF);
  static const Color cardBg = Colors.white;

  // Keep old names for backward compatibility
  static const Color primaryColor = primary;
  static const Color secondaryColor = accent;
  static const Color errorColor = error;
  static const Color successColor = success;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: Brightness.light,
        surface: surface,
      ),
      scaffoldBackgroundColor: surface,
      textTheme: GoogleFonts.notoSansTextTheme().copyWith(
        bodyLarge: GoogleFonts.notoSans(fontSize: 16, color: const Color(0xFF1C1C2E)),
        bodyMedium: GoogleFonts.notoSans(fontSize: 14, color: const Color(0xFF4A4A6A)),
        bodySmall: GoogleFonts.notoSans(fontSize: 12, color: const Color(0xFF7A7A9A)),
        titleLarge: GoogleFonts.notoSans(fontSize: 24, fontWeight: FontWeight.bold, color: const Color(0xFF1C1C2E)),
        titleMedium: GoogleFonts.notoSans(fontSize: 18, fontWeight: FontWeight.w600, color: const Color(0xFF1C1C2E)),
        labelLarge: GoogleFonts.notoSans(fontSize: 16, fontWeight: FontWeight.w600),
      ),
      appBarTheme: AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 1,
        backgroundColor: primary,
        foregroundColor: Colors.white,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        titleTextStyle: GoogleFonts.notoSans(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        shadowColor: primary.withOpacity(0.3),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
          textStyle: GoogleFonts.notoSans(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          side: const BorderSide(color: Color(0xFFDDE1F0), width: 1.5),
          textStyle: GoogleFonts.notoSans(fontSize: 16, fontWeight: FontWeight.w500),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFDDE1F0), width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFDDE1F0), width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        filled: true,
        fillColor: Colors.white,
        labelStyle: GoogleFonts.notoSans(color: const Color(0xFF7A7A9A)),
        hintStyle: GoogleFonts.notoSans(color: const Color(0xFFB0B4CC)),
        prefixIconColor: const Color(0xFF7A7A9A),
        suffixIconColor: const Color(0xFF7A7A9A),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFEEF0FA), width: 1),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 0, vertical: 6),
        shadowColor: Colors.black12,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: CircleBorder(),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFFEEF0FA),
        thickness: 1,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFFEEF0FA),
        labelStyle: GoogleFonts.notoSans(fontSize: 12, color: primary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
