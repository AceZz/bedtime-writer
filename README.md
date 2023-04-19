# Dreamy Tales (`bedtime-writer`)

## License

All rights reserved to Tristan Stampfler and Pierre Wan-Fat

## Local setup

This project contains a frontend (the Flutter app) and a backend (powered by Cloud Functions, in
the `functions` folder). In this section, you will configure the app to run 100% locally, with a
backend emulator.

### Frontend (Flutter)

#### Installation

Install Flutter by following [the official guide](https://docs.flutter.dev/get-started/install).

Install [the Firebase CLI tool](https://firebase.google.com/docs/cli#setup_update_cli) (up until the
"Use the CLI with CI systems" section).

#### Configuration

This app uses a `.env` file to set configuration values. Copy the file `.env.example` in the
`bedtime-writer` folder (the top-level folder) and paste it as `.env`. **`.env` should never be
committed.**

Open `.env` and set the `BACKEND` key to `local`. This will make the app use a local, emulated
backend.

The `DEBUG_*` keys can be set to `true` to display some debug helpers in the app.

#### Tests

Run the unit tests with `flutter test`.

### Backend (Cloud Functions)

Before doing anything else, change your working directory: `cd functions`. The instructions in that
section assume you are in the `functions` folder.

#### Installation

Install [Node.js v18](https://nodejs.org/en/download).

We recommend using Visual Studio Code to edit the code, with the ESLint and Prettier extensions.
You should be able to launch Prettier with the `npx prettier` command.

The Firebase emulator should have been already installed in the previous step.

Run `npm install` to install all the needed packages.

#### Configuration

The repository already contains a `.env` file. This file contains the environment variables used
when deploying the code on Google Cloud. **This file should not be edited unless you have a good
reason.**

Copy-paste the `.env` file to a `.env.local` file and change both `TEXT_API` and `IMAGE_API` to
`fake`.

Finally, [get an OpenAI API key](https://platform.openai.com/overview), create a `.secret.local`
file, and fill it with:

```text
OPENAI_API_KEY=...
```

If you do not create such a file, it will use the production API key by default (retrieved from
Google Cloud), which is not a good practice.

#### Tests

Run the unit tests with `npm test`.

### Launch the app locally

In one terminal, in the `functions` folder, run `npm run build:watch`. The TypeScript will be built
in the background every time you edit a file. Check the output of this command soon, as any build
error will appear there.

In another terminal, still in `functions`, launch the backend emulators with
`npm run local_backend`.

Run the Flutter app with `flutter run --debug` (in the `bedtime-stories` folder). Your app should
use the local backend and fake data.

Afterwards, you can start developing. If you wish to use the real Cloud functions, set
`BACKEND=remote` in your `.env` file.

## Deployment

### Firebase rules

The `*.rules` files in the main folder are only used for the Firebase emulators. To deploy them on
the production server, use the
[Firebase console](https://console.firebase.google.com/project/bedtime-writer/firestore/rules).

### Secrets

We use Google Cloud Secret Manager to store secrets such as the Open AI API key. See
[the corresponding documentation](https://firebase.google.com/docs/functions/config-env#secret-manager).

### Deploy the backend

Run `npm run deploy_functions` in the `functions` folder. Reminder: it will use the `.env` file,
not `.env.local`.

### Deploy the Web frontend

**This frontend should only be used for testing campaigns.**

1. Deploy the rules and the backend if needed (see above).
2. Edit `bedtime-writer/.env` if needed (you most certainly want to disable the `DEBUG_` keys and 
   set `BACKEND=remote`).
3. Run `flutter build web --web-renderer canvaskit` (using this specific Web renderer is important
   for the Lottie animations). If the Firebase emulators are running, visit <http://localhost:5000>
   to preview what you are about to deploy.
4. Deploy with `npm run deploy_hosting` in the `functions` folder. This deploys the app with
   Firebase Hosting. You can retrieve the link in
   [the console](https://console.firebase.google.com/project/bedtime-writer/hosting/sites). Be aware
   that the link expires after 7 days by default (this can be changed in the console).

**Never publish anything to the "real", live channel.** Our goal is not to publish to the Web, we
only use it as a convenient way to share a test version of our app. Publishing to the live channel
is dangerous, as it has a very easy to guess URL and no expiration time, so we cannot control its
access.

If you ever publish to the live channel, delete everything inside the `bedtime-writer/build/web`
folder, create a blank `index.html` file in it, and run `firebase deploy --only hosting` from the
`functions` folder. This should erase everything you uploaded.

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
