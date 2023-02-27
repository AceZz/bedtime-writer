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

  final useFirebaseEmulators =
      dotenv.get('USE_FIREBASE_EMULATORS', fallback: 'false').toLowerCase() ==
          'true';
  if (useFirebaseEmulators) {
    firestore.useFirestoreEmulator('localhost', 8080);
    functions.useFunctionsEmulator('localhost', 5001);
    storage.useStorageEmulator('localhost', 9199);
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
