# Dreamy Tales

## License

All rights reserved to Tristan Stampfler and Pierre Wan-Fat

## Code organization

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

## Environment file

To use the Firebase emulators, create a `.env` file with the following content:

```
USE_FIREBASE_EMULATORS=true
```
