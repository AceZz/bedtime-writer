import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'backend.dart';
import 'firebase_options.dart';
import 'router.dart';
import 'theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  configureFirebaseEmulators();

  if (auth.currentUser == null) {
    auth.signInAnonymously();
  }

  runApp(ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Dreamy Tales',
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      locale: Locale('en-US'),
      theme: theme,
      themeMode: ThemeMode.system,
      routerDelegate: router.routerDelegate,
      routeInformationParser: router.routeInformationParser,
    );
  }
}
