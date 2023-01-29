import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kLocaleStorageKey = '__locale_key__';

class FFLocalizations {
  FFLocalizations(this.locale);

  final Locale locale;

  static FFLocalizations of(BuildContext context) =>
      Localizations.of<FFLocalizations>(context, FFLocalizations)!;

  static List<String> languages() => ['en', 'fr', 'de'];

  static late SharedPreferences _prefs;

  static Future initialize() async =>
      _prefs = await SharedPreferences.getInstance();

  static Future storeLocale(String locale) =>
      _prefs.setString(_kLocaleStorageKey, locale);

  static Locale? getStoredLocale() {
    final locale = _prefs.getString(_kLocaleStorageKey);
    return locale != null && locale.isNotEmpty ? createLocale(locale) : null;
  }

  String get languageCode => locale.toString();

  int get languageIndex => languages().contains(languageCode)
      ? languages().indexOf(languageCode)
      : 0;

  String getText(String key) =>
      (kTranslationsMap[key] ?? {})[locale.toString()] ?? '';

  String getVariableText({
    String? enText = '',
    String? frText = '',
    String? deText = '',
  }) =>
      [enText, frText, deText][languageIndex] ?? '';
}

class FFLocalizationsDelegate extends LocalizationsDelegate<FFLocalizations> {
  const FFLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    final language = locale.toString();
    return FFLocalizations.languages().contains(
      language.endsWith('_')
          ? language.substring(0, language.length - 1)
          : language,
    );
  }

  @override
  Future<FFLocalizations> load(Locale locale) =>
      SynchronousFuture<FFLocalizations>(FFLocalizations(locale));

  @override
  bool shouldReload(FFLocalizationsDelegate old) => false;
}

Locale createLocale(String language) => language.contains('_')
    ? Locale.fromSubtags(
        languageCode: language.split('_').first,
        scriptCode: language.split('_').last,
      )
    : Locale(language);

final kTranslationsMap = <Map<String, Map<String, String>>>[
  // Character
  {
    'gvezls3h': {
      'en': 'Tonight\'s story main character is:',
      'de': 'Die Hauptfigur der heutigen Geschichte ist:',
      'fr': 'Le personnage principal de l\'histoire de ce soir est :',
    },
    'i1al9aaj': {
      'en': 'Home',
      'de': 'Heim',
      'fr': 'Domicile',
    },
  },
  // Question
  {
    'rb36nn9v': {
      'en': 'Home',
      'de': 'Heim',
      'fr': 'Domicile',
    },
  },
  // Loading
  {
    'ar0rrzuk': {
      'en': 'Your story is being created...',
      'de': '',
      'fr': '',
    },
    '0t1ly7lm': {
      'en': 'Home',
      'de': '',
      'fr': '',
    },
  },
  // Story
  {
    'sw9vnusl': {
      'en': 'Share',
      'de': '',
      'fr': '',
    },
    'p1poyibz': {
      'en': 'Home',
      'de': 'Heim',
      'fr': 'Domicile',
    },
  },
].reduce((a, b) => a..addAll(b));
