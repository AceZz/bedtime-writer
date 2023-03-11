# Dreamy Tales

## License

All rights reserved to Tristan Stampfler and Pierre Wan-Fat

## Build

Create a `.env` file in the same folder as the `pubspec.lock` file, with the following content:

```
USE_FIREBASE_EMULATORS=false
```

## Deployment

### Firebase rules

The `*.rules` files in the main folder are only used for the Firebase emulators. To deploy them on
the production server, use the Google Cloud console.

## Development

### Code organization

* `lib/`: contains the Flutter code
  * `feature_name/`: everything related to a specific feature
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

Then, go to the `functions` folder and follow the instructions of `functions/README.md`. When
everything is set up, you can launch the emulators by running `npm run emulators`.
