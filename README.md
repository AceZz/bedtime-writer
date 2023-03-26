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

### Line separators

Line separators should always be LF. On Unix and macOS, you have nothing to do. On Windows, ensure
that `git config --local core.autocrlf` is `false`, and use an editor that can use LF. The
`.gitattributes` file should ensure that Git always uses LF. You might have to [refresh your
repository](https://docs.github.com/en/get-started/getting-started-with-git/configuring-git-to-handle-line-endings#refreshing-a-repository-after-changing-line-endings).

### Code organization

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

### Debug mode

Add this key to the `.env` file:

```text
DEBUG=true
DEBUG_LOADING=true
```

### Backend emulation

Before deploying your functions to Google Cloud, test them locally with the emulators. To use the
Firebase emulators, add this key to the `.env` file:

```text
USE_FIREBASE_EMULATORS=true
```

Then, go to the `functions` folder and follow the instructions of `functions/README.md`. When
everything is set up, you can launch the emulators by running `npm run emulators`.
