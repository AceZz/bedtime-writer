// File generated by FlutterFire CLI.
// ignore_for_file: lines_longer_than_80_chars, avoid_classes_with_only_static_members
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAzm4JnLoPx5xDuW2x3VDRb494838r63JQ',
    appId: '1:596701039771:web:261b4cb8bbe957dc758a3e',
    messagingSenderId: '596701039771',
    projectId: 'bedtime-writer',
    authDomain: 'bedtime-writer.firebaseapp.com',
    storageBucket: 'bedtime-writer.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAO-2jQTyEPCOYJsI37ZFiSf9gNWBZWvoo',
    appId: '1:596701039771:android:46542c1616de2984758a3e',
    messagingSenderId: '596701039771',
    projectId: 'bedtime-writer',
    storageBucket: 'bedtime-writer.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAxg_LFlr0sZrbpHe27rAqIsEfFMACSecI',
    appId: '1:596701039771:ios:c7dbc0fefbb30fbc758a3e',
    messagingSenderId: '596701039771',
    projectId: 'bedtime-writer',
    storageBucket: 'bedtime-writer.appspot.com',
    iosClientId: '596701039771-l5583cm0tolhnn6tjapmad51akjel1k5.apps.googleusercontent.com',
    iosBundleId: 'com.tap.bedtimewriter',
  );
}
