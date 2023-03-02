# Dreamy Tales

## License

All rights reserved to Tristan Stampfler and Pierre Wan-Fat

## Code organization

* `lib/`: contains the Flutter code
  * `feature_name/`: everything related to a specific feature
    * `backend/`: calls to external APIs
    * `screens/`: screens and related widgets
    * `states/`: states and logic attached to them
    * `index.start`: should reexport the screens
  * `widgets/`: contains widgets that are reused across screens
  * `main.dart`: entry point of the application
  * `router.dart`: the routes of the application
  * `theme.dart`: the theme for the entire application
