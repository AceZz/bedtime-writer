# Deployment

## Step 0: configure signing the app

Normally, you should only do this once per machine:

1. Ask Tristan or Pierre to get the keystore used for the app.
2. Follow the steps from [Flutter doc](https://docs.flutter.dev/deployment/android#signing-the-app)
   on signing the app, skipping the keystore creation step.

## Step 1: deploy on `dev`

The Cloud functions, Firestore rules, and Firestore indexes should be up-to-date (updated before
each PR merge).

1. If needed, run scripts to populate the database (see [Administration tools](./admin.md)).
2. Check that the Firebase rules are equal to the `*.rules` files.
3. Check that everything works (in particular, the Firestore indexes).

## Step 2: release a new version on `main`

1. Define the new version number using [Semantic Versioning](https://semver.org/):
   `MAJOR.MINOR.PATCH`. Display the commits since the last release with `git log <last_version>..`
   (you can find the last version with `git tag` or in `pubspec.yaml`).
   If there is a `BREAKING CHANGE` (or `!`), increment `MAJOR`; if there is a `feat:`,
   increment `MINOR`; otherwise, increment `PATCH`.
   Yes, we are using a single version number for _two_ different projects (frontend and backend),
   which is not perfect.
2. Create a new branch called `dev-<version>` from `main` (e.g. `git switch main` then
   `git switch -c dev-1.2.3`).
3. Set the version number in `pubspec.yaml`.
4. Commit with the message `release: <version>` (e.g. `git commit -a -m "release: 1.2.3"`).
5. Push a PR **targeting `main`** (e.g. `git push -u origin dev-1.2.3`).
6. Merge the PR after the CI passes ("Rebase and merge").
7. After the PR is merged, pull `main`, switch to `main`, and add an annotated Git tag
   (e.g. `git tag -a 1.2.3 -m "release: 1.2.3"`).
8. Push the tag (e.g. `git push origin 1.2.3`).

## Step 3: merge `main` in `prod`

1. Go to <https://github.com/App-Galaxy/bedtime-writer/compare/prod...main>, and create a new PR *
   *targeting `prod`**.
2. After the CI passes, merge the PR with "Create a merge commit", with the message
   `release: <version>-prod` (e.g. "release: 1.2.3-prod").

## Step 4: deploy on `prod`

1. Ensure 
   [the prod rules](https://console.firebase.google.com/project/bedtime-writer/firestore/rules)
   match
   [the dev rules](https://console.firebase.google.com/project/bedtime-writer-dev/firestore/rules).
2. Ensure
   [the prod indexes](https://console.firebase.google.com/project/bedtime-writer/firestore/indexes)
   match
   [the dev indexes](https://console.firebase.google.com/project/bedtime-writer-dev/firestore/indexes).
3. Deploy the Cloud functions: run `npm run deploy_functions_prod` in the `functions` folder.
   Reminder: it will use the `.env` file, not `.env.local`.
4. If needed, run scripts to populate the database (see [Administration tools](./admin.md)).
5. Build the app and upload it to Google Play / the App Store.
   * For Android, see <https://docs.flutter.dev/deployment/android#building-the-app-for-release>

## Deploy the Web frontend

**This frontend should only be used for testing campaigns.**

1. Deploy the rules and the backend if needed (see above).
2. Edit `bedtime-writer/.env` if needed (you most certainly want to disable the `DEBUG_` keys and
   set `BACKEND=remote`).
3. Run `flutter build web --web-renderer canvaskit` (using this specific Web renderer is important
   for the Lottie animations). If the Firebase emulators are running, visit <http://localhost:5000>
   to preview what you are about to deploy.
4. Deploy with `npm run deploy_hosting_dev` or `npm run deploy_hosting_prod` in the `functions`
   folder. This deploys the app with Firebase Hosting. You can retrieve the link in
   the console (
   [dev](https://console.firebase.google.com/project/bedtime-writer-dev/hosting/sites),
   [prod](https://console.firebase.google.com/project/bedtime-writer/hosting/sites)). Be aware
   that the link expires after 7 days by default (this can be changed in the console).

**Never publish anything to the "real", live channel.** Our goal is not to publish to the Web, we
only use it as a convenient way to share a test version of our app. Publishing to the live channel
is dangerous, as it has a very easy to guess URL and no expiration time, so we cannot control its
access.

If you ever publish to the live channel, delete everything inside the `bedtime-writer/build/web`
folder, create a blank `index.html` file in it, and run `firebase deploy --only hosting` from the
`functions` folder. This should erase everything you uploaded.

## iOS

### Dependencies

CocoaPods is used as a dependency manager. Flutter will automatically run `pod install` to install 
the correct pods (dependencies) for you when you are doing `flutter run` or `flutter build` for an 
iOS device.

As an optimization for build duration, a fixed version of the `FirebaseFirestore` pod is directly 
downloaded from GitHub as specified in `ios/Podfile`. SDK version needs to be updated manually if 
issues are found, followed by a `flutter clean`.

### Emulators

To reset the cache of an iOS simulated device, go the iOS simulator menu: Device > Erase All
Content And Settings.
