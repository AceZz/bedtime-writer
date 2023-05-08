# Development

## Prod and dev environments

### Set up and maintain the prod environment

1. Create a separate Firebase project for prod and set-up all services.
2. Create flutter flavors for dev and prod (reference here).
3. Android: Make sure you’ve added the `google-services.json` for both Firebase projects (dev and prod) in the respective android folders. Also make sure you have set up Flutter flavors correctly.
4. Select the right dev or prod Firebase project: `firebase use <project-id>`.
5. Generate the options file `firebase_options.dart` for Firebase: `flutterfire configure -p <project-id> -a com.tap.bedtimewriter.<env>`. This to be done once and only once at beginning of prod branch, so that prod branch has its own configuration. It is to be updated accordingly as changes are being made like when a new service is added. Please also delete the google-services.json that this command will generate as it will create one outside of prod and dev. Explanations: -p specifies the Firebase project, -a specifies the android app ( = dev or prod). Should be adapted for iOS with -i.

### Switch between dev and prod environments

1. Select the right dev or prod Firebase project: `firebase use <project-id>`.
2. After that build the functions `npm run build:watch`.
3. Local: Run the local backend `npm run local_backend`. Note: run first the Firebase emulators before launching the android emulator as some ports may conflict.
4. Remote: Deploy the functions `npm run deploy_functions`.
5. Finally run (or build) the app: `flutter run --flavor <env> -d <device-emulator-id>`.

## Line separators

Line separators should always be LF. On Unix and macOS, you have nothing to do. On Windows, ensure
that `git config --local core.autocrlf` is `false`, and use an editor that can use LF. The
`.gitattributes` file should ensure that Git always uses LF. You might have to [refresh your
repository](https://docs.github.com/en/get-started/getting-started-with-git/configuring-git-to-handle-line-endings#refreshing-a-repository-after-changing-line-endings).

## Code organization

* `lib/`: contains the Flutter code
    * `feature_name/`: everything related to a specific feature
        * `screens/`: screens and related widgets
        * `states/`: states and logic attached to them
        * `index.start`: should reexport the screens
    * `backend/`: contains calls to the backend (auth, database, etc.)
    * `widgets/`: contains widgets that are reused across screens
    * `main.dart`: entry point of the application
    * `router.dart`: the routes of the application
    * `theme.dart`: the theme for the entire application
