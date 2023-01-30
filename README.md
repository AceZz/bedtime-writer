# Bedtime writer

## License

All rights reserved to Tristan Stampfler and Pierre Wan-Fat

## Code organization

* `lib`: contains the Flutter code
  * `feature_name`: everything related to a specific feature
    * `backend`: calls to external APIs
    * `screens`: screens and related widgets
    * `states`: states and logic attached to them
  * `widgets`: contains widgets that are reused accross screens
  * `main.dart`: entry point of the application
