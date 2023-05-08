# Development

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
