# Local setup

This project contains a frontend (the Flutter app) and a backend (powered by Cloud Functions, in
the `functions` folder). In this section, you will configure the app to run 100% locally, with a
backend emulator.

## Frontend (Flutter)

### Installation

Install Flutter by following [the official guide](https://docs.flutter.dev/get-started/install).

Install [the Firebase CLI tool](https://firebase.google.com/docs/cli#setup_update_cli) (up until the
"Use the CLI with CI systems" section).

### Configuration

This app uses a `.env` file to set configuration values. Copy the file `.env.example` in the
`bedtime-writer` folder (the top-level folder) and paste it as `.env`. **`.env` should never be
committed.**

Open `.env` and set the `BACKEND` key to `local`. This will make the app use a local, emulated
backend.

The `DEBUG_*` keys can be set to `true` to display some debug helpers in the app.

See [Configuration](./configuration.md#frontend) for more details on the frontend configuration.

### Tests

Run the unit tests with `flutter test`.

## Backend (Cloud Functions)

Before doing anything else, change your working directory: `cd functions`. The instructions in that
section assume you are in the `functions` folder.

### Installation

Install [Node.js v18](https://nodejs.org/en/download).

We recommend using Visual Studio Code to edit the code, with the ESLint and Prettier extensions.
You should be able to launch Prettier with the `npx prettier` command.

The Firebase emulator should have been already installed in the previous step.

Run `npm install` to install all the needed packages.

### Configuration

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

See [Configuration](./configuration.md#backend) for more details on the backend configuration.

### Tests

Run the unit tests with `npm test`.

## Launch the app locally

In one terminal, in the `functions` folder, run `npm run build:watch`. The TypeScript will be built
in the background every time you edit a file. Check the output of this command regularly, as any
build error will appear there.

In another terminal, still in `functions`, launch the backend emulators with
`npm run local_backend`.

Run the Flutter app with `flutter run --debug` (in the `bedtime-stories` folder). Your app should
use the local backend and fake data.

Afterwards, you can start developing. If you wish to use the real Cloud functions, set
`BACKEND=remote` in your `.env` file.
