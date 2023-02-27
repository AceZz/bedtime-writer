# Dreamy Tales

## License

All rights reserved to Tristan Stampfler and Pierre Wan-Fat

## Build

Create a `.env` file in the same folder as the `pubspec.lock` file, with the following content:

```
USE_FIREBASE_EMULATORS=false
```

## Development

### Code organization

* `lib/`: contains the Flutter code
  * `feature_name/`: everything related to a specific feature
    * `backend/`: calls to external APIs
    * `screens/`: screens and related widgets
    * `states/`: states and logic attached to them
    * `index.start`: should reexport the screens
  * `widgets/`: contains widgets that are reused across screens
  * `backend.dart`: calls to the Firebase backend
  * `main.dart`: entry point of the application
  * `router.dart`: the routes of the application
  * `theme.dart`: the theme for the entire application

### Backend emulation

Before deploying your functions to Google Cloud, test them locally with the emulators. To use the
Firebase emulators, give the `.env` file the following content:

```
USE_FIREBASE_EMULATORS=true
```

You can then launch them by going to the `functions` folder and run `npm run emulators`.