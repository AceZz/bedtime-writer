# Development

## Environments

| Environment | Branch | Firebase project   | Android package name                    | Apple bundle ID                         |
|-------------|--------|--------------------|-----------------------------------------|-----------------------------------------|
| dev         | main   | bedtime-writer-dev | com.dreamstorestudios.bedtimewriter.dev | com.dreamstorestudios.bedtimewriter.dev |
| prod        | prod   | bedtime-writer     | com.dreamstorestudios.bedtimewriter     | com.dreamstorestudios.bedtimewriter     |

New features are first merged into `main` and tested on the dev environment. When it's time for a
new release, `main` is merged into `prod` and a new
[Git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) is created.

Note: we used to have a `bedtime-writer-prod` Firebase project, but it was almost never used, and
has been deleted.

Note: the Android package names must be different, otherwise we cannot use Firebase Auth with the
same SHA1 fingerprint.

### Switch between environments

1. Checkout the right branch for the right environment (`prod` for prod and all other branches for dev).
2. Select the right Firebase project (`bedtime-writer` for production, `bedtime-writer-dev` for
   development): `firebase use <project-id>`.
3. Build the functions: `npm run build:watch`.
4. If needed, run the local backend `npm run local_backend`. Note: run the Firebase emulators
   before launching the Android emulator, as some ports may conflict.
5. If you want to deploy to the remote servers, use `npm run deploy_functions_<dev|prod>`.
6. Delete the `build` folder.
7. Wipe the data/cache of your device emulator.
8. Finally run (or build) the app: `flutter run --flavor <env> -d <device-emulator-id>`.

### Create and maintain an environment

#### Create a Firebase project

This should be mostly straightforward. Read or edit the table above for the Android package name and
Apple bundle ID. If needed, here are some default values:
* Default GCP resource location: europe-west6
* Users and permissions: add Pierre and Tristan as owners
* Upgrade the Firebase billing plan to "Blaze"

#### Update the code

1. Commit before anything else!
2. Create [a new Flutter flavor](https://docs.flutter.dev/deployment/flavors) for it.
3. Select the new Firebase project: `firebase use <project-id>`.
4. Generate the options file `firebase_options.dart` for Firebase:
   `flutterfire configure -p <firebase_project> -a <android_package_name> -i <apple_bundle_id>`.
   See the table above for the values. This might have to be done again when a new service is added
   to the project.
5. Finally, move the `android/app/google-services.json` file to the `android/app/src/<flavor>`
   folder.

Your `AndroidManifest.xml` files (located in `android/app/src/<debug|main|prod>`) should refer to
the *same* package name: `com.dreamstorestudios.bedtimewriter`. This should also be the name of the
package declared in `MainActivity.kt`. The only place where `*.dev` should appear in a package name
is in the `build.gradle`.

#### Configure the Firebase services

##### Authentication

Enable "Email/Password", "Google" and "Anonymous" providers.

To finish configuring Google authentication, you need to "add the SHA1 fingerprint" of the Android
app. See
[this page](https://developers.google.com/android/guides/client-auth#self-signing_your_application)
for the official instructions (`gradlew signingReport` works well). Put the fingerprint in the
settings of the project, in the Android app.

##### Firestore

Configure Firestore to use the "Native mode". Do not forget to update the rules and indexes (see
[Deployment](./deployment.md)).

##### Functions

See [Deployment](./deployment.md) to deploy them.

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

## Frequent bugs

### Global tips

If you have a bug you cannot explain, you can try to (every of the following tips has helped us at
least once):

* search for logs (of the Flutter application, of the emulator,
  [of GCP](https://console.cloud.google.com/logs/), etc.)
* clear the cache or uninstall the app on the phone emulator
* restart (your computer, the emulators, Android Studio, etc.)
* remove the `build` folder

### Debug remote Cloud Functions

In a nutshell, if your function seems to be never called (nothing in the logs) and redeploying does
not solve the problem, try to **remove the function completely** (on the Firebase console) and then
redeploy it. This will reset the permissions of the function, which might be the issue.

This already happened! The Cloud function on the production project did not work with the remote
server (no logs on the Android emulator, no logs on GCP), but it did on the development project. For
reference, those are the steps that helped us (after a lot of debugging):

* We noticed that, by accessing the function directly via its URL (something like
  <https://europe-west1-bedtime-writer.cloudfunctions.net/createClassicStoryRequest>), the error was
  not the same (`prod` was returning a 403, `dev` a JSON document with an error field).
* We realized that the **GCP** configuration of the functions was different in the "Permissions"
  tab. The `prod` function was missing the `allUsers` principal (role "Cloud Function Invoker").
* Even after manually adding the missing principal, the function did not work (because of another
  missing permission, certainly). We thus removed and redeployed the function, and it worked!

### "CLEARTEXT communication to 10.0.2.2 not permitted by network security policy"

This may happen when using the Android Emulator. Communication with the emulator can only use HTTP;
however, HTTP is disabled by default on Android >= 9. To avoid this, whitelist 10.0.2.2.

See <https://developer.android.com/training/articles/security-config> for guidance (you will
certainly have to edit `android/app/src/main/AndroidManifest.xml` and create a file for network
security parameters).
