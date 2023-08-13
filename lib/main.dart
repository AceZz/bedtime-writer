import 'dart:developer';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:logging/logging.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'backend/index.dart';
import 'firebase_options.dart';
import 'logger.dart';
import 'router.dart';
import 'theme.dart';

void main() async {
  configureLogging();

  WidgetsFlutterBinding.ensureInitialized();

  // Force portrait orientation for display
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  await dotenv.load();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  configureFirebaseEmulators();

  // Sign in anonymously
  try {
    final firebaseAuth = FirebaseAuth.instance;
    final user = firebaseAuth.currentUser;
    if (user == null) {
      await firebaseAuth.signInAnonymously();
    }
  } catch (error) {
    log(
      'An error occurred during anonymous sign-in: $error',
      name: 'main',
      level: Level.SEVERE.value,
    );
  }

  Paint.enableDithering = true; // Make smoother gradient

  // Load the [SharedPreferences].
  final sharedPreferences = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesBaseProvider.overrideWithValue(sharedPreferences)
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return ScreenUtilInit(
      designSize: const Size(360, 690),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp.router(
          title: 'Dreamy Tales',
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          locale: const Locale('en-US'),
          theme: AppTheme(context).theme,
          themeMode: ThemeMode.system,
          routerDelegate: router.routerDelegate,
          routeInformationParser: router.routeInformationParser,
          routeInformationProvider: router.routeInformationProvider,
        );
      },
    );
  }
}
