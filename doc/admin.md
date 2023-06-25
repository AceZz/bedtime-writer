# Administration tools

The `admin` folder contains a Node.js project with tools to administrate `bedtime-writer`.

## Setup

These instructions will use `bedtime-writer-dev` as an example. Change the project accordingly if
necessary.

### Node setup

Go to the `admin` folder and run `npm install --include=dev`.

### Service account file

Go to <https://console.firebase.google.com/u/0/project/bedtime-writer-dev/settings/serviceaccounts/adminsdk>
and click on "Generate new private key". You will download a JSON file that contains a secret key
to connect to Firebase services.

**Keep this file secure.** Anybody with this file has basically all the rights on our project. Do
not send it over the Internet (in particular, do not commit it). If you think there is any chance
that someone was given access to it, **revoke your access immediately**. To do so, go to
<https://console.cloud.google.com/iam-admin/serviceaccounts?authuser=0&project=bedtime-writer-dev&hl=en>,
select the `firebase-adminsdk` account, go to Keys and remove your key (the key ID is in the JSON
file).

Rename the file to `service-account.json` or `service-account-dev.json` and put it in the `admin`
folder.

## Run

Run `firebase use bedtime-writer-dev`.

Then, set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable:

* on Linux or macOS: `export GOOGLE_APPLICATION_CREDENTIALS="service-account-dev.json"`
* on Windows PowerShell: `$env:GOOGLE_APPLICATION_CREDENTIALS="service-account-dev.json"`

**This has to be done every time you close your shell.**

### Using the emulators

By default, the real Firebase servers are used. If you want to use the Firebase emulators, run them
with `npm run local_backend` in *either* `functions` or `admin` (just make sure they are not already
launched) and create a `.env` file in the `admin` folder with this content:

```
USE_FIREBASE_EMULATORS=true
```

Note: if the Firebase emulators are not used even if the environment variable is set, it may be
because you did not call `initFirebase()` of `src/firebase_utils.ts` in your script.

This command creates emulators with **no data**. We provide some tools to quickly add data from
files (see below) but, as you can guess, it can be quite annoying to do so every time you want to
launch the emulators. Thankfully, a shortcut is possible, the `npm run lbd` command, for "local
backend (with) data". See below to configure it.

### Run the tests

You can run the tests with `npm test`. These tests always use the emulators, so make sure they are
launched!

### Tools

* `npm run set_story_questions [questions.yaml]`: set the story questions for the current project
  (on the emulator if `USE_FIREBASE_EMULATORS` is `true`). By default,
  `admin/data/story/questions.yaml` is used.
* `npm run compress_story_images [folder]`: compress the images of the story choices. By default,
  `admin/data/` is used.
* `npm run add_story_form [form.yaml]`: add a story form. By default, `admin/data/story/form.yaml`
  is used, and the form is valid now (i.e. it immediately replaces any other form). You can add
  a `start` field next to the `questions` field if you want to change the start date of the form
  (`start: "2023-05-11T00:13:32Z"`). Finally, this script will fail if any of the provided questions
  or choices is not in `story__questions`. If necessary, run `set_story_questions` before. 

## Start the local backend with pre-loaded data

### First-time setup

The following commands must be run in the `admin` folder.

Make sure to set `USE_FIREBASE_EMULATORS=true` in `admin/.env` and start the local
backend: `npm run local_backend`

Fill it with some data. You can choose whichever data you want, a good start is
`npm run set_story_questions` and `npm run add_story_form` (run them in another terminal, you will
be likely asked to set `GOOGLE_APPLICATION_CREDENTIALS` first).

Export the Firebase data with `firebase emulators:export local_backend_export`. Firebase will write
to `local_backend_export`. This folder should never be committed!

### Use

Compile the code in both `admin` and `functions` (`npm run build:watch`).

Make sure to set `USE_FIREBASE_EMULATORS=true` in `admin/.env` and start the local backend
with `npm run lbd` (still in `admin`). Your data previously saved should be restored. `lbd` is a
shortcut for "local backend (with) data".
